import type { StatKey } from '../domain/types';
import { parseAdvancementModifiers } from './advancementModifiersService';

export type AdvancementType =
  | { kind: 'stat'; stat: StatKey; bonus: number; maxStat: number }
  | { kind: 'luck' }
  | { kind: 'move-same' }
  | { kind: 'move-other' }
  | { kind: 'mark-basic-moves' }
  | { kind: 'other' };

export function getAdvancementType(text: string): AdvancementType {
  if (/chance/i.test(text)) return { kind: 'luck' };
  if (/(?:cochez|marquez|notez).+manœuvres? de base/i.test(text)) return { kind: 'mark-basic-moves' };
  if (/manœuvre d'un autre livret/i.test(text)) return { kind: 'move-other' };
  if (/manœuvre/i.test(text)) return { kind: 'move-same' };

  const modifiers = parseAdvancementModifiers(text);
  if (modifiers.length > 0) {
    const maxMatch = text.match(/\(\+(\d+)\s*max\.\)/);
    if (maxMatch) {
      return {
        kind: 'stat',
        stat: modifiers[0].stat,
        bonus: modifiers[0].value,
        maxStat: parseInt(maxMatch[1], 10),
      };
    }
  }

  return { kind: 'other' };
}

export function getAvailableAdvancements(
  advancements: string[],
  taken: string[],
): string[] {
  const takenCounts = new Map<string, number>();
  for (const adv of taken) {
    takenCounts.set(adv, (takenCounts.get(adv) ?? 0) + 1);
  }

  const consumedSlots = new Map<string, number>();
  const result: string[] = [];

  for (const adv of advancements) {
    const type = getAdvancementType(adv);

    if (type.kind === 'stat') {
      const timesTaken = takenCounts.get(adv) ?? 0;
      if (timesTaken < type.maxStat) {
        result.push(adv);
      }
    } else {
      const alreadyConsumed = consumedSlots.get(adv) ?? 0;
      const alreadyTaken = takenCounts.get(adv) ?? 0;
      if (alreadyConsumed < alreadyTaken) {
        consumedSlots.set(adv, alreadyConsumed + 1);
      } else {
        result.push(adv);
      }
    }
  }

  return result;
}
