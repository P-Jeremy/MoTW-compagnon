import { useEffect, useMemo, useState } from 'react';
import { useDocument, useDocuments, useRepo } from '@automerge/automerge-repo-react-hooks';
import type { AutomergeUrl } from '@automerge/automerge-repo';
import { playbooks, getPlaybook } from './application/playbookService';
import type { Character } from './domain/types';
import { normalizeCharacter } from './infrastructure/characterRepository';
import { getRootUrl, syncUrl } from './infrastructure/repo';
import { CharacterCreator } from './ui/components/CharacterCreator';
import { CharacterList } from './ui/components/CharacterList';
import { CharacterSheetContainer } from './ui/components/CharacterSheet';
import fr from './data/locales/fr.json';

type View = 'list' | 'create' | 'sheet';

interface RootDoc {
  characterUrls: AutomergeUrl[];
}

interface CharacterEntry {
  url: AutomergeUrl;
  character: Character;
}

export default function App() {
  const repo = useRepo();
  const [rootUrl, setRootUrl] = useState<AutomergeUrl | undefined>(undefined);
  const [bootError, setBootError] = useState(false);
  const [syncSlow, setSyncSlow] = useState(false);
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch the server's root document URL. On failure (server down, port
  // conflict in dev:full, …) we surface an explicit error instead of hanging
  // forever on the loading screen. `bootAttempt` lets the user retry.
  const [bootAttempt, setBootAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setBootError(false);
    getRootUrl()
      .then((url) => {
        if (!cancelled) setRootUrl(url);
      })
      .catch(() => {
        if (!cancelled) setBootError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bootAttempt]);

  const [rootDoc, changeRoot] = useDocument<RootDoc>(rootUrl, { suspense: false });

  // If we have the URL but the document never syncs (wedged IndexedDB, offline
  // first run with no local copy, …), show a hint + recovery after a delay.
  useEffect(() => {
    if (!rootUrl || rootDoc) {
      setSyncSlow(false);
      return;
    }
    const timer = setTimeout(() => setSyncSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [rootUrl, rootDoc]);

  // Diagnostics: while the root document is loading, track whether we actually
  // connected to a sync peer and what state the document find is in. This makes
  // a stuck sync legible on screen (no peer = WebSocket problem; peer but
  // unavailable = missing document; etc.).
  const [diag, setDiag] = useState({ peers: 0, findState: 'idle', error: '', ws: 'idle' });
  // Raw WebSocket probe: connect to the same /sync URL the repo uses and report
  // the outcome. This isolates "can the browser even open the socket" from the
  // automerge sync handshake, so a peers:0 stall points to the real layer.
  useEffect(() => {
    if (!rootUrl || rootDoc) return;
    const url = syncUrl();
    setDiag((d) => ({ ...d, ws: `connexion ${url}` }));
    let socket: WebSocket | undefined;
    try {
      socket = new WebSocket(url);
      socket.onopen = () => {
        setDiag((d) => ({ ...d, ws: 'ouverte (101)' }));
        socket?.close();
      };
      socket.onerror = () => {
        setDiag((d) => ({ ...d, ws: `échec de connexion → ${url}` }));
      };
    } catch (error) {
      setDiag((d) => ({ ...d, ws: `erreur: ${String(error)}` }));
    }
    return () => socket?.close();
  }, [rootUrl, rootDoc]);

  useEffect(() => {
    if (!rootUrl || rootDoc) return;
    const net = repo.networkSubsystem;
    const refreshPeers = () => setDiag((d) => ({ ...d, peers: (repo.peers ?? []).length }));
    const onUnavailable = () => setDiag((d) => ({ ...d, error: 'unavailable' }));
    net?.on('peer', refreshPeers);
    net?.on('peer-disconnected', refreshPeers);
    repo.on('unavailable-document', onUnavailable);

    const poll = setInterval(() => {
      try {
        const progress = repo.findWithProgress<RootDoc>(rootUrl);
        setDiag((d) => ({ ...d, findState: progress.state, peers: (repo.peers ?? []).length }));
      } catch (error) {
        setDiag((d) => ({ ...d, error: String(error) }));
      }
    }, 1000);
    refreshPeers();

    return () => {
      net?.off('peer', refreshPeers);
      net?.off('peer-disconnected', refreshPeers);
      repo.off('unavailable-document', onUnavailable);
      clearInterval(poll);
    };
  }, [repo, rootUrl, rootDoc]);
  const characterUrls = useMemo(() => rootDoc?.characterUrls ?? [], [rootDoc]);
  const [charMap] = useDocuments<Character>(characterUrls, { suspense: false });

  const entries = useMemo<CharacterEntry[]>(
    () =>
      characterUrls.flatMap((url) => {
        const character = charMap.get(url);
        return character ? [{ url, character }] : [];
      }),
    [characterUrls, charMap],
  );
  const characters = useMemo(() => entries.map((entry) => entry.character), [entries]);

  const selectedEntry = entries.find((entry) => entry.character.id === selectedId);
  const selectedPlaybook = selectedEntry ? getPlaybook(selectedEntry.character.playbookId) : undefined;

  // Escape hatch when the local IndexedDB copy is wedged: wipe it and reload.
  // The server remains the source of truth, so nothing is lost.
  function resetLocalData() {
    indexedDB.deleteDatabase('motw-companion');
    window.location.reload();
  }

  function addCharacter(character: Character) {
    const handle = repo.create<Character>(normalizeCharacter(character));
    changeRoot((doc) => {
      doc.characterUrls.push(handle.url);
    });
    setSelectedId(character.id);
    setView('sheet');
  }

  function deleteSelectedCharacter() {
    if (!selectedEntry) return;
    const confirmed = window.confirm(`${fr.sheet.deleteConfirm} ${selectedEntry.character.name} ?`);
    if (!confirmed) return;
    const { url } = selectedEntry;
    changeRoot((doc) => {
      const index = doc.characterUrls.indexOf(url);
      if (index !== -1) doc.characterUrls.splice(index, 1);
    });
    repo.delete(url);
    setSelectedId(null);
    setView('list');
  }

  if (!rootUrl || !rootDoc) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        {bootError ? (
          <>
            <p className="text-base font-bold text-red-700">{fr.app.serverErrorTitle}</p>
            <p className="max-w-md text-sm text-stone-500">{fr.app.serverErrorHint}</p>
            <button
              type="button"
              onClick={() => setBootAttempt((n) => n + 1)}
              className="rounded bg-stone-800 px-4 py-2 text-sm font-bold text-white hover:bg-stone-700"
            >
              {fr.app.retry}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-stone-500">{rootUrl ? fr.app.syncing : fr.app.loading}</p>
            {syncSlow && (
              <>
                <p className="max-w-md text-sm text-stone-500">{fr.app.syncSlowHint}</p>
                <pre className="max-w-md whitespace-pre-wrap rounded bg-stone-100 px-3 py-2 text-left text-xs text-stone-600">
                  {`serveur: ${rootUrl ? 'OK' : 'inconnu'}\n`}
                  {`websocket /sync: ${diag.ws}\n`}
                  {`pairs connectés: ${diag.peers}\n`}
                  {`état du document: ${diag.findState}${diag.error ? ` (${diag.error})` : ''}`}
                </pre>
                <button
                  type="button"
                  onClick={resetLocalData}
                  className="rounded border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100"
                >
                  {fr.app.resetLocal}
                </button>
              </>
            )}
          </>
        )}
      </main>
    );
  }

  if (view === 'create') {
    return <CharacterCreator playbooks={playbooks} onCancel={() => setView('list')} onCreate={addCharacter} />;
  }

  if (view === 'sheet' && selectedEntry && selectedPlaybook) {
    return (
      <CharacterSheetContainer
        url={selectedEntry.url}
        playbook={selectedPlaybook}
        onBack={() => setView('list')}
        onDelete={deleteSelectedCharacter}
      />
    );
  }

  return (
    <CharacterList
      characters={characters}
      playbooks={playbooks}
      onCreate={() => setView('create')}
      onOpen={(id) => {
        setSelectedId(id);
        setView('sheet');
      }}
      onImport={addCharacter}
    />
  );
}
