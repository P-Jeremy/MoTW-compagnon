import type { StatKey } from './types';
import fr from '../data/locales/fr.json';

export const statLabels: Record<StatKey, string> = {
  charm: fr.stats.charm,
  cool: fr.stats.cool,
  sharp: fr.stats.sharp,
  tough: fr.stats.tough,
  weird: fr.stats.weird,
};

export const statOrder: StatKey[] = ['charm', 'cool', 'sharp', 'tough', 'weird'];

export function formatModifier(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
