import type { StatKey } from '../domain/types';

interface StatModifier {
  stat: StatKey;
  value: number;
}

/**
 * Extrait les modificateurs de stat des descriptions d'améliorations
 * Reconnaît les patterns: "+1 Charme", "+1 Cool", "+1 Sharp", "+1 Tough", "+1 Weird", etc.
 */
export function parseAdvancementModifiers(advancement: string): StatModifier[] {
  const modifiers: StatModifier[] = [];
  
  // Mapping des noms de stats en français et anglais
  const statMappings: Record<string, StatKey> = {
    'charme': 'charm',
    'charm': 'charm',
    'cool': 'cool',
    'bizarre': 'weird',
    'weird': 'weird',
    'futé': 'sharp',
    'sharp': 'sharp',
    'coriace': 'tough',
    'tough': 'tough',
  };

  // Cherche tous les patterns de modificateurs: +1, +2, +3, -1, -2, etc.
  // suivi d'un nom de stat
  const modifierPattern = /([+-]\d+)\s+([A-Za-zàâäûüêçœæ]+)/gi;
  let match;

  while ((match = modifierPattern.exec(advancement)) !== null) {
    const value = parseInt(match[1], 10);
    const statName = match[2].toLowerCase();
    const stat = statMappings[statName];

    if (stat && !modifiers.some(m => m.stat === stat)) {
      modifiers.push({ stat, value });
    }
  }

  return modifiers;
}

/**
 * Calcule le modificateur total pour une stat donnée
 * en fonction de toutes les améliorations prises
 */
export function calculateAdvancementModifier(
  advancements: string[],
  stat: StatKey
): number {
  return advancements.reduce((total, advancement) => {
    const modifiers = parseAdvancementModifiers(advancement);
    const statModifier = modifiers.find(m => m.stat === stat);
    return total + (statModifier?.value ?? 0);
  }, 0);
}

/**
 * Calcule tous les modificateurs totaux pour toutes les stats
 */
export function calculateAllAdvancementModifiers(
  advancements: string[]
): Record<StatKey, number> {
  const stats: StatKey[] = ['charm', 'cool', 'sharp', 'tough', 'weird'];
  const modifiers: Record<StatKey, number> = {
    charm: 0,
    cool: 0,
    sharp: 0,
    tough: 0,
    weird: 0,
  };

  stats.forEach(stat => {
    modifiers[stat] = calculateAdvancementModifier(advancements, stat);
  });

  return modifiers;
}
