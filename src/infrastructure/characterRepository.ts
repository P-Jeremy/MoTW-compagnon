import type { Character, Stats } from '../domain/types';

export async function loadCharacters(): Promise<Character[] | null> {
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
  fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(characters, null, 2),
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
