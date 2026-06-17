import { Dices } from 'lucide-react';
import type { DiceRoll, StatKey, Stats } from '../../domain/types';
import { statLabels, formatModifier } from '../../domain/statLabels';
import { roll2d6 } from '../../application/dice';
import fr from '../../data/locales/fr.json';

interface DiceRollerProps {
  stats: Stats;
  stat?: StatKey;
  extraBonus?: number;
  onRoll: (roll: DiceRoll) => void;
  lastRoll?: DiceRoll;
}

const rollTierLabels: Record<DiceRoll['tier'], string> = {
  success: fr.rollTiers.success,
  mixed: fr.rollTiers.mixed,
  failure: fr.rollTiers.failure,
};

export function DiceRoller({ stats, stat, extraBonus = 0, onRoll, lastRoll }: DiceRollerProps) {
  const label = stat ? statLabels[stat] : fr.dice.noStat;
  const bonusSuffix = extraBonus > 0 ? ` ${fr.dice.advancedBonus}` : '';

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <button
        type="button"
        onClick={() => onRoll(roll2d6(stats, stat, extraBonus))}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-800"
      >
        <Dices className="h-4 w-4" />
        {fr.dice.roll} 2d6 {stat ? `+ ${label}` : ''}{bonusSuffix}
      </button>
      {lastRoll ? (
        <div className="mt-3 grid gap-1 text-sm text-stone-700">
          <p>
            {fr.dice.rawResult} : {lastRoll.dieA} + {lastRoll.dieB} = {lastRoll.dieA + lastRoll.dieB}
          </p>
          <p>
            {fr.dice.modifier} : {lastRoll.stat ? `${formatModifier(lastRoll.modifier - (lastRoll.extraBonus ?? 0))} ${statLabels[lastRoll.stat]}` : formatModifier(lastRoll.modifier)}{lastRoll.extraBonus && lastRoll.extraBonus > 0 ? ` +${lastRoll.extraBonus} ${fr.dice.advancedBonus}` : ''}
          </p>
          <p className="font-bold text-ink">{fr.dice.total} : {lastRoll.total}</p>
          <p className="font-bold text-ember">{rollTierLabels[lastRoll.tier]}</p>
        </div>
      ) : null}
    </div>
  );
}
