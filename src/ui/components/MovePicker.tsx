import { type JSX, useState } from 'react';
import type { Move, Playbook } from '../../domain/types';
import { playbooks } from '../../application/playbookService';
import fr from '../../data/locales/fr.json';

interface MovePickerProps {
  mode: 'same' | 'other';
  currentPlaybookId: string;
  ownedMoveIds: string[];
  onSelect: (moveId: string) => void;
  onCancel: () => void;
}

export function MovePicker({ mode, currentPlaybookId, ownedMoveIds, onSelect, onCancel }: MovePickerProps): JSX.Element {
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);

  const title = mode === 'same' ? fr.movePicker.titleSame : fr.movePicker.titleOther;

  function getAvailableMoves(playbook: Playbook): Move[] {
    return playbook.moves.filter((move) => !ownedMoveIds.includes(move.id));
  }

  function handleConfirm() {
    if (selectedMoveId) {
      onSelect(selectedMoveId);
    }
  }

  const otherPlaybooks = playbooks.filter(
    (pb) => pb.id !== currentPlaybookId && getAvailableMoves(pb).length > 0
  );

  const currentPlaybook = playbooks.find((pb) => pb.id === currentPlaybookId);
  const sameMoves = currentPlaybook ? getAvailableMoves(currentPlaybook) : [];
  const otherMoves = selectedPlaybook ? getAvailableMoves(selectedPlaybook) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-base font-bold text-ink">{title}</h2>

        {mode === 'same' && (
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-2">
              {sameMoves.length === 0 ? (
                <p className="text-sm text-stone-500">{fr.movePicker.noMovesAvailable}</p>
              ) : (
                sameMoves.map((move) => (
                  <button
                    key={move.id}
                    type="button"
                    onClick={() => setSelectedMoveId(move.id)}
                    className={`w-full rounded-md border px-4 py-3 text-left transition ${
                      selectedMoveId === move.id
                        ? 'border-ember bg-ember/10'
                        : 'border-stone-200 bg-stone-50 hover:border-ember hover:bg-ember/10'
                    }`}
                  >
                    <p className="text-sm font-semibold">{move.name}</p>
                    <p className="mt-1 text-xs text-stone-500 line-clamp-2">{move.description}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {mode === 'other' && !selectedPlaybook && (
          <div className="grid gap-2">
            <p className="mb-2 text-sm text-stone-500">{fr.movePicker.choosePlaybook}</p>
            {otherPlaybooks.map((pb) => (
              <button
                key={pb.id}
                type="button"
                onClick={() => setSelectedPlaybook(pb)}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-ember hover:bg-ember/10"
              >
                {pb.name}
              </button>
            ))}
          </div>
        )}

        {mode === 'other' && selectedPlaybook && (
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlaybook(null);
                  setSelectedMoveId(null);
                }}
                className="mb-1 text-left text-xs text-stone-500 underline hover:text-ink"
              >
                ← {selectedPlaybook.name}
              </button>
              {otherMoves.length === 0 ? (
                <p className="text-sm text-stone-500">{fr.movePicker.noMovesAvailable}</p>
              ) : (
                otherMoves.map((move) => (
                  <button
                    key={move.id}
                    type="button"
                    onClick={() => setSelectedMoveId(move.id)}
                    className={`w-full rounded-md border px-4 py-3 text-left transition ${
                      selectedMoveId === move.id
                        ? 'border-ember bg-ember/10'
                        : 'border-stone-200 bg-stone-50 hover:border-ember hover:bg-ember/10'
                    }`}
                  >
                    <p className="text-sm font-semibold">{move.name}</p>
                    <p className="mt-1 text-xs text-stone-500 line-clamp-2">{move.description}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ember hover:bg-ember/10"
          >
            {fr.movePicker.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedMoveId}
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
              selectedMoveId
                ? 'border-ember bg-ember text-white hover:bg-ember/90'
                : 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
            }`}
          >
            {fr.movePicker.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
