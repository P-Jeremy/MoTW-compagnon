import { cn } from '../lib/cn';
import fr from '../../data/locales/fr.json';

interface TrackerProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  tone?: 'luck' | 'xp' | 'harm';
}

export function Tracker({ label, value, max, onChange, tone = 'luck' }: TrackerProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">{label}</h2>
        <span className="text-sm font-semibold text-stone-500">
          {value}/{max}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: max }, (_, index) => {
          const boxValue = index + 1;
          const checked = boxValue <= value;
          return (
            <button
              key={boxValue}
              type="button"
              aria-label={`${label} ${boxValue}`}
              onClick={() => onChange(value === boxValue ? boxValue - 1 : boxValue)}
              className={cn(
                'aspect-square rounded border text-sm font-bold transition',
                checked && tone === 'luck' && 'border-steel bg-steel text-white',
                checked && tone === 'xp' && 'border-ember bg-ember text-white',
                checked && tone === 'harm' && 'border-red-700 bg-red-700 text-white',
                !checked && 'border-stone-300 bg-stone-50 text-stone-300 hover:border-stone-500',
              )}
            >
              {checked ? '■' : '□'}
            </button>
          );
        })}
      </div>
      {tone === 'xp' && value >= max ? (
        <p className="mt-3 rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-ember">
          {fr.tracker.advancementAvailable}
        </p>
      ) : null}
      {tone === 'harm' && value >= 4 && value < 7 ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {fr.tracker.unstable}
        </p>
      ) : null}
      {tone === 'harm' && value >= 7 ? (
        <p className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white">{fr.tracker.dying}</p>
      ) : null}
    </section>
  );
}
