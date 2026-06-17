import { useState } from 'react';
import type { Move } from '../../domain/types';
import fr from '../../data/locales/fr.json';
import { cn } from '../lib/cn';

interface BasicMovePickerProps {
  moves: Move[];
  count: number;
  onConfirm: (moveIds: string[]) => void;
  onCancel: () => void;
}

export function BasicMovePicker({ moves, count, onConfirm, onCancel }: BasicMovePickerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((m) => m !== id);
      if (current.length >= count) return current;
      return [...current, id];
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-black text-ink">{fr.basicMovePicker.title}</h2>
        <p className="mt-2 text-sm text-stone-600">{fr.basicMovePicker.description}</p>

        <div className="mt-4 grid gap-2">
          {moves.map((move) => {
            const isSelected = selected.includes(move.id);
            const isDisabled = !isSelected && selected.length >= count;
            return (
              <button
                key={move.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggle(move.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 text-left transition',
                  isSelected && 'border-steel bg-steel/10 text-ink',
                  !isSelected && !isDisabled && 'border-stone-200 bg-white hover:border-stone-400',
                  isDisabled && 'cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300',
                )}
              >
                <span
                  className={cn(
                    'h-4 w-4 shrink-0 rounded border',
                    isSelected ? 'border-steel bg-steel' : 'border-stone-300',
                  )}
                />
                <span className="text-sm font-bold">{move.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-bold text-ink"
          >
            {fr.basicMovePicker.cancel}
          </button>
          <button
            type="button"
            disabled={selected.length !== count}
            onClick={() => onConfirm(selected)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white disabled:bg-stone-300"
          >
            {fr.basicMovePicker.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
