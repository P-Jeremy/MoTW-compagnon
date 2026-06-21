import { Repo, type AutomergeUrl } from '@automerge/automerge-repo';
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';

export function syncUrl(): string {
  const { protocol, host } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${host}/sync`;
}

// A single browser-wide Repo: it syncs with the server over WebSocket and keeps
// a local-first copy of every document in IndexedDB, so edits survive reloads
// and work offline, then re-sync automatically on reconnect.
export const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter(syncUrl())],
  storage: new IndexedDBStorageAdapter('motw-companion'),
});

export async function getRootUrl(): Promise<AutomergeUrl> {
  const response = await fetch('/api/root');
  if (!response.ok) throw new Error('Failed to fetch root document URL');
  const { url } = (await response.json()) as { url: AutomergeUrl };
  return url;
}
