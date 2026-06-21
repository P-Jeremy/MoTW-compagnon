export interface UserIdentity {
  userId: string;
  name: string;
  color: string;
}

const STORAGE_KEY = 'motw-identity';

const NAMES = ['Renard', 'Corbeau', 'Loup', 'Hibou', 'Lynx', 'Faucon', 'Ours', 'Sanglier', 'Chouette', 'Belette', 'Cerf', 'Blaireau'];
const COLORS = ['#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777'];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// A stable, per-browser pseudonym + colour used only for live presence badges.
// Persisted so the same browser keeps the same identity across reloads.
export function getIdentity(): UserIdentity {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as UserIdentity;
    } catch {
      // corrupt value, fall through and regenerate
    }
  }
  const identity: UserIdentity = {
    userId: crypto.randomUUID(),
    name: pick(NAMES),
    color: pick(COLORS),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}
