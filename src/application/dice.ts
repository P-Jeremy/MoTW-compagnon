import type { DiceRoll, StatKey, Stats } from '../domain/types';

export function roll2d6(
  stats: Stats,
  stat?: StatKey,
  extraBonus: number = 0,
): DiceRoll {
  return buildDiceRoll(randomDie(), randomDie(), stats, stat, extraBonus);
}

export function buildDiceRoll(
  dieA: number,
  dieB: number,
  stats: Stats,
  stat?: StatKey,
  extraBonus: number = 0,
): DiceRoll {
  const modifier = (stat ? stats[stat] : 0) + extraBonus;
  const total = dieA + dieB + modifier;
  return {
    dieA,
    dieB,
    modifier,
    extraBonus: extraBonus > 0 ? extraBonus : undefined,
    stat,
    total,
    tier: total >= 10 ? 'success' : total >= 7 ? 'mixed' : 'failure',
  };
}

function randomDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}
