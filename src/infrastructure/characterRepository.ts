import type { Character, Stats } from '../domain/types';

// Persistence/sync is handled by Automerge (see src/infrastructure/repo.ts).
// This module only normalizes characters so every document has all fields,
// used when creating, importing, or migrating a character.

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
