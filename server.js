import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Repo, parseAutomergeUrl } from '@automerge/automerge-repo';
import { NodeWSServerAdapter } from '@automerge/automerge-repo-network-websocket';
import { NodeFSStorageAdapter } from '@automerge/automerge-repo-storage-nodefs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const AUTOMERGE_DIR = path.join(DATA_DIR, 'automerge');
const ROOT_FILE = path.join(DATA_DIR, 'root.json');
const LEGACY_FILE = path.join(DATA_DIR, 'characters.json');
const PORT = process.env.PORT ?? 3000;

fs.mkdirSync(AUTOMERGE_DIR, { recursive: true });

const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/sync' });

// The server is a sync peer: it stores every document on disk and relays
// changes between all connected clients. `sharePolicy: true` means it offers
// every document it knows about to every peer that connects.
const storage = new NodeFSStorageAdapter(AUTOMERGE_DIR);
const repo = new Repo({
  network: [new NodeWSServerAdapter(wss)],
  storage,
  sharePolicy: async () => true,
});

// Log peer lifecycle so a stuck client sync is diagnosable from the server too.
repo.networkSubsystem.on('peer', ({ peerId }) => console.log(`[sync] peer connected: ${peerId}`));
repo.networkSubsystem.on('peer-disconnected', ({ peerId }) => console.log(`[sync] peer disconnected: ${peerId}`));

/**
 * The "root" document holds the ordered list of character document URLs.
 * Its own URL is stored in data/root.json so it stays stable across restarts.
 * On first boot we create it, migrating any characters from the legacy
 * data/characters.json single-file store into individual Automerge documents.
 */
async function getOrCreateRootUrl() {
  if (fs.existsSync(ROOT_FILE)) {
    const { url } = JSON.parse(fs.readFileSync(ROOT_FILE, 'utf-8'));
    // Don't trust root.json blindly: verify the document actually exists in
    // storage. A dangling pointer (automerge store wiped while root.json was
    // left behind) would otherwise make every client hang forever on an
    // "unavailable" document. If it's gone, fall through and recreate it.
    if (url && (await rootDocExists(url))) {
      return url;
    }
    console.warn(`Root document ${url ?? '(none)'} is unavailable; recreating it.`);
  }

  const rootHandle = repo.create({ characterUrls: [] });

  if (fs.existsSync(LEGACY_FILE)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf-8'));
      if (Array.isArray(legacy)) {
        for (const character of legacy) {
          const handle = repo.create(character);
          rootHandle.change((doc) => {
            doc.characterUrls.push(handle.url);
          });
        }
        console.log(`Migrated ${legacy.length} character(s) from characters.json`);
      }
    } catch (error) {
      console.error('Failed to migrate legacy characters.json:', error);
    }
  }

  await repo.flush();
  fs.writeFileSync(ROOT_FILE, JSON.stringify({ url: rootHandle.url }, null, 2));
  return rootHandle.url;
}

/**
 * Resolve whether the root document is actually present in this server's
 * on-disk store. We query storage directly rather than via `repo.find`, because
 * find() on a missing document leaves an unready handle in the repo that later
 * breaks `repo.flush()`. An empty chunk list means the document doesn't exist.
 */
async function rootDocExists(url) {
  try {
    const { documentId } = parseAutomergeUrl(url);
    const chunks = await storage.loadRange([documentId]);
    return chunks.length > 0;
  } catch {
    return false;
  }
}

const rootUrlPromise = getOrCreateRootUrl();

app.get('/api/root', async (_req, res) => {
  try {
    res.json({ url: await rootUrlPromise });
  } catch (error) {
    console.error('Failed to resolve root document:', error);
    res.status(500).json({ error: 'root document unavailable' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// The http server's EADDRINUSE is re-emitted on the WebSocketServer too, so we
// handle both to avoid an unhandled-exception crash and print a clear message.
function handleListenError(error) {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `\n✖ Le port ${PORT} est déjà utilisé — un autre serveur tourne probablement déjà.\n` +
        `  Arrête-le d'abord, par exemple :\n` +
        `    pkill -f "node server.js"\n` +
        `  ou lance sur un autre port : PORT=3001 npm start\n` +
        `  (Tant qu'un ancien serveur tourne, le navigateur lui parle et reste bloqué sur la synchronisation.)\n`,
    );
  } else {
    console.error('Erreur du serveur :', error);
  }
  process.exit(1);
}
server.on('error', handleListenError);
wss.on('error', handleListenError);

server.listen(PORT, () => {
  console.log(`MOTW Companion (CRDT sync) running on http://localhost:${PORT}`);
});
