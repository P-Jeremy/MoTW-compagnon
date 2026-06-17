import { Info } from 'lucide-react';
import type { DiceRoll, Move, Stats } from '../../domain/types';
import { statLabels } from '../../domain/statLabels';
import { DiceRoller } from './DiceRoller';
import fr from '../../data/locales/fr.json';

interface MoveCardProps {
  move: Move;
  stats: Stats;
  lastRoll?: DiceRoll;
  onRoll: (roll: DiceRoll) => void;
  extraBonus?: number;
}

export function MoveCard({ move, stats, lastRoll, onRoll, extraBonus = 0 }: MoveCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-3 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black leading-6 text-ink">{move.name}</h3>
          {move.rollStat ? (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-bold text-ember">+{statLabels[move.rollStat]}</p>
              {extraBonus > 0 ? (
                <span className="rounded bg-steel px-1.5 py-0.5 text-xs font-bold text-white">
                  {fr.basicMovePicker.advancedBadge}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <MoveDetails move={move} />
      </div>
      {move.rollStat ? (
        <div className="mt-3">
          <DiceRoller
            stats={stats}
            stat={move.rollStat}
            extraBonus={extraBonus}
            onRoll={onRoll}
            lastRoll={lastRoll}
          />
        </div>
      ) : null}
    </article>
  );
}

function MoveDetails({ move }: { move: Move }) {
  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        aria-label={`${fr.move.details} ${move.name}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-stone-50 text-stone-700 transition hover:border-ember hover:text-ember focus:border-ember focus:outline-none focus:ring-2 focus:ring-orange-100"
      >
        <Info className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute right-0 top-11 z-20 w-[min(82vw,28rem)] rounded-lg border border-stone-200 bg-white p-4 text-left opacity-0 shadow-soft ring-1 ring-black/5 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <h4 className="text-base font-black text-ink">{move.name}</h4>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-700">{move.description}</p>

          <dl className="mt-4 grid gap-3 text-sm">
            {move.trigger ? (
              <div>
                <dt className="font-bold text-stone-900">{fr.move.trigger}</dt>
                <dd className="mt-1 whitespace-pre-line leading-6 text-stone-700">{move.trigger}</dd>
              </div>
            ) : null}
            {move.rollStat ? (
              <div>
                <dt className="font-bold text-stone-900">{fr.move.roll}</dt>
                <dd className="mt-1 text-stone-700">+{statLabels[move.rollStat]}</dd>
              </div>
            ) : null}
            {move.results?.success ? (
              <div>
                <dt className="font-bold text-stone-900">10+</dt>
                <dd className="mt-1 whitespace-pre-line leading-6 text-stone-700">{move.results.success}</dd>
              </div>
            ) : null}
            {move.results?.mixed ? (
              <div>
                <dt className="font-bold text-stone-900">7-9</dt>
                <dd className="mt-1 whitespace-pre-line leading-6 text-stone-700">{move.results.mixed}</dd>
              </div>
            ) : null}
            {move.results?.failure ? (
              <div>
                <dt className="font-bold text-stone-900">6-</dt>
                <dd className="mt-1 whitespace-pre-line leading-6 text-stone-700">{move.results.failure}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  );
}
