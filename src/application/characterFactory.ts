import type { Character, HunterLink, Playbook, StatArray, Weapon } from '../domain/types';

export interface CharacterDraft {
  name: string;
  playbook: Playbook;
  statArray: StatArray;
  moveIds: string[];
  equipment: Weapon[];
  history?: string;
  links?: HunterLink[];
  playbookSection?: Record<string, string | string[]>;
}

export function createCharacter(draft: CharacterDraft): Character {
  return {
    id: crypto.randomUUID(),
    name: draft.name.trim(),
    playbookId: draft.playbook.id,
    stats: draft.statArray.stats,
    moves: [...(draft.playbook.moveChoices.fixed ?? []), ...draft.moveIds],
    equipment: draft.equipment,
    luck: { current: 0, max: 7 },
    xp: { current: 0, max: 5 },
    harm: { current: 0, max: 7 },
    history: draft.history?.trim() ?? '',
    notes: '',
    links: draft.links ?? [],
    advancementsTaken: [],
    advancedAdvancementsTaken: [],
    galonsTaken: 0,
    playbookSection: draft.playbookSection ?? {},
    advancedBasicMoves: [],
  };
}
