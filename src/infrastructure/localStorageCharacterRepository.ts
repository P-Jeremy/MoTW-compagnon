import type { Character, Stats } from '../domain/types';

const STORAGE_KEY = 'motw.characters.v1';

export function loadCharacters(): Character[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Character[];
    return Array.isArray(parsed) ? parsed.map(normalizeCharacter) : [];
  } catch {
    return [];
  }
}


export async function loadCharactersFromFile(): Promise<Character[] | null> {
  try {
    const response = await fetch('/api/characters');
    if (!response.ok) return null;
    const data = await response.json() as Character[];
    return Array.isArray(data) ? data.map(normalizeCharacter) : null;
  } catch {
    return null;
  }
}

export function saveCharacters(characters: Character[]): void {
  const json = JSON.stringify(characters, null, 2);
  localStorage.setItem(STORAGE_KEY, json);
  fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
  }).catch(() => {});
}

export function normalizeCharacter(character: Character): Character {
  const advancementsTaken = character.advancementsTaken ?? [];
  const advancedAdvancementsTaken = character.advancedAdvancementsTaken ?? [];
  return {
    ...character,
    stats: normalizeStats(character.stats),
    history: character.history ?? '',
    notes: character.notes ?? '',
    moves: character.moves ?? [],
    links: character.links ?? [],
    advancementsTaken,
    advancedAdvancementsTaken,
    galonsTaken: character.galonsTaken ?? (advancementsTaken.length + advancedAdvancementsTaken.length),
    playbookSection: character.playbookSection ?? {},
    advancedBasicMoves: character.advancedBasicMoves ?? [],
  };
}

function normalizeStats(stats: Stats | Record<string, number>): Stats {
  const values = stats as Record<string, number | undefined>;

  return {
    charm: values.charm ?? values.charme ?? 0,
    cool: values.cool ?? 0,
    sharp: values.sharp ?? values.fute ?? 0,
    tough: values.tough ?? values.coriace ?? 0,
    weird: values.weird ?? values.bizarre ?? 0,
  };
}
