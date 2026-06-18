import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createCharacter } from '../../application/characterFactory';
import { hasPlaybookSection, isSectionValid } from '../../application/playbookSectionService';
import { PlaybookSectionPicker } from './PlaybookSectionPicker';
import { formatModifier, statLabels, statOrder } from '../../domain/statLabels';
import type { Character, Playbook, StatArray, Weapon } from '../../domain/types';
import { cn } from '../lib/cn';
import fr from '../../data/locales/fr.json';


interface CharacterCreatorProps {
  playbooks: Playbook[];
  onCancel: () => void;
  onCreate: (character: Character) => void;
}

export function CharacterCreator({ playbooks, onCancel, onCreate }: CharacterCreatorProps) {
  const [step, setStep] = useState(1);
  const [playbookId, setPlaybookId] = useState(playbooks[0]?.id ?? '');
  const [name, setName] = useState('');
  const [statArrayId, setStatArrayId] = useState('');
  const [moveIds, setMoveIds] = useState<string[]>([]);
  const [weaponIds, setWeaponIds] = useState<string[]>([]);
  const [hunterLinks, setHunterLinks] = useState<Record<number, string>>({});
  const [history, setHistory] = useState('');
  const [playbookSection, setPlaybookSection] = useState<Record<string, string | string[]>>({});

  const playbook = useMemo(
    () => playbooks.find((item) => item.id === playbookId) ?? playbooks[0],
    [playbookId, playbooks],
  );
  const statArray = playbook.statArrays.find((item) => item.id === statArrayId) ?? playbook.statArrays[0];
  const allWeapons = playbook.gearChoices.flatMap((choice) => choice.options);
  const selectedWeapons = allWeapons.filter((weapon) => weaponIds.includes(weapon.id));
  const canFinish =
    name.trim().length > 0 &&
    Boolean(statArray) &&
    moveIds.length === playbook.moveChoices.choose &&
    playbook.gearChoices.every((choice) => choice.options.filter((weapon) => weaponIds.includes(weapon.id)).length === choice.choose);

  const hasSection = hasPlaybookSection(playbook);
  const totalSteps = hasSection ? 7 : 6;
  const displayStep = !hasSection && step > 5 ? step - 1 : step;

  function resetForPlaybook(id: string) {
    setPlaybookId(id);
    setStatArrayId('');
    setMoveIds([]);
    setWeaponIds([]);
    setHunterLinks({});
    setPlaybookSection({});
  }

  function toggleMove(id: string) {
    setMoveIds((current) => {
      if (current.includes(id)) return current.filter((moveId) => moveId !== id);
      if (current.length >= playbook.moveChoices.choose) return current;
      return [...current, id];
    });
  }

  function toggleWeapon(choiceId: string, weapon: Weapon) {
    const choice = playbook.gearChoices.find((item) => item.id === choiceId);
    if (!choice) return;

    setWeaponIds((current) => {
      if (current.includes(weapon.id)) return current.filter((id) => id !== weapon.id);
      const choiceSelected = choice.options.filter((option) => current.includes(option.id));
      if (choiceSelected.length >= choice.choose) return current;
      return [...current, weapon.id];
    });
  }

  function finish() {
    if (!canFinish) return;
    const links = playbook.histories
      .map((prompt, i) => ({ prompt, hunterName: (hunterLinks[i] ?? '').trim() }))
      .filter((link) => link.hunterName.length > 0);
    onCreate(
      createCharacter({
        name,
        playbook,
        statArray,
        moveIds,
        equipment: selectedWeapons,
        history: history.trim() || undefined,
        links,
        playbookSection,
      }),
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={step === 1 ? onCancel : () => setStep(step === 7 && !hasSection ? 5 : step - 1)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {fr.creator.back}
        </button>
        <span className="text-sm font-bold text-stone-500">
          {fr.creator.step} {displayStep}/{totalSteps}
        </span>
      </header>

      {step === 1 ? (
        <StepShell title={fr.creator.choosePlaybook} description={fr.creator.choosePlaybookDescription}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => resetForPlaybook(item.id)}
                className={cn(
                  'rounded-lg border bg-white p-4 text-left shadow-soft transition hover:border-ember',
                  item.id === playbookId ? 'border-ember ring-2 ring-orange-100' : 'border-stone-200',
                )}
              >
                <strong className="block text-lg font-black text-ink">{item.name}</strong>
                <span className="mt-2 block text-sm leading-6 text-stone-600">{item.description}</span>
              </button>
            ))}
          </div>
          <NextButton onClick={() => setStep(2)} />
        </StepShell>
      ) : null}

      {step === 2 ? (
        <StepShell title={fr.creator.characterName} description={playbook.name}>
          <label className="block max-w-xl">
            <span className="text-sm font-bold text-stone-700">{fr.creator.name}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              className="mt-2 min-h-12 w-full rounded-md border border-stone-300 bg-white px-4 text-lg font-bold text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
              placeholder={fr.creator.namePlaceholder}
            />
          </label>
          <NextButton onClick={() => setStep(3)} disabled={name.trim().length === 0} />
        </StepShell>
      ) : null}

      {step === 3 ? (
        <StepShell title={fr.creator.statArray} description={fr.creator.statArrayDescription}>
          <div className="grid gap-3 md:grid-cols-2">
            {playbook.statArrays.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatArrayId(item.id)}
                className={cn(
                  'rounded-lg border bg-white p-4 text-left shadow-soft transition hover:border-ember',
                  item.id === statArray.id ? 'border-ember ring-2 ring-orange-100' : 'border-stone-200',
                )}
              >
                <strong className="text-lg font-black text-ink">{item.label}</strong>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {statOrder.map((stat) => (
                    <span key={stat} className="rounded-md bg-stone-100 p-2 text-center">
                      <span className="block text-xs font-bold text-stone-500">{statLabels[stat]}</span>
                      <span className="text-lg font-black text-ink">{formatModifier(item.stats[stat])}</span>
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <NextButton onClick={() => setStep(4)} />
        </StepShell>
      ) : null}

      {step === 4 ? (
        <StepShell
          title={fr.creator.movesAndGear}
          description={`${playbook.name} · ${fr.creator.chooseStartingOptions}`}
        >
          <section>
            {(() => {
              const fixedIds = playbook.moveChoices.fixed ?? [];
              const fixedMoves = playbook.moves.filter((m) => fixedIds.includes(m.id));
              const fromIds = playbook.moveChoices.from ?? [];
              const choosableMoves = fromIds.length > 0
                ? playbook.moves.filter((m) => fromIds.includes(m.id))
                : playbook.moves.filter((m) => !fixedIds.includes(m.id));
              return (
                <>
                  {fixedMoves.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-base font-black text-ink">Manœuvres automatiquement acquises</h2>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {fixedMoves.map((move) => (
                          <div
                            key={move.id}
                            className="rounded-lg border border-ember bg-orange-50 p-4 text-left shadow-soft ring-2 ring-orange-100"
                          >
                            <span className="flex items-start justify-between gap-3">
                              <strong className="text-base font-black text-ink">{move.name}</strong>
                              <Check className="h-5 w-5 shrink-0 text-ember" />
                            </span>
                            <span className="mt-2 block text-sm leading-6 text-stone-600">{move.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <h2 className="text-base font-black text-ink">
                    {fr.creator.moves} ({moveIds.length}/{playbook.moveChoices.choose})
                  </h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {choosableMoves.map((move) => (
                      <button
                        key={move.id}
                        type="button"
                        onClick={() => toggleMove(move.id)}
                        className={cn(
                          'rounded-lg border bg-white p-4 text-left shadow-soft transition hover:border-ember',
                          moveIds.includes(move.id) ? 'border-ember ring-2 ring-orange-100' : 'border-stone-200',
                        )}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <strong className="text-base font-black text-ink">{move.name}</strong>
                          {moveIds.includes(move.id) ? <Check className="h-5 w-5 text-ember" /> : null}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-stone-600">{move.description}</span>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </section>

          <section className="mt-6 grid gap-5">
            {playbook.gearChoices.map((choice) => {
              const count = choice.options.filter((weapon) => weaponIds.includes(weapon.id)).length;
              return (
                <div key={choice.id}>
                  <h2 className="text-base font-black text-ink">
                    {choice.label} ({count}/{choice.choose})
                  </h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {choice.options.map((weapon) => (
                      <button
                        key={weapon.id}
                        type="button"
                        onClick={() => toggleWeapon(choice.id, weapon)}
                        className={cn(
                          'rounded-lg border bg-white p-4 text-left shadow-soft transition hover:border-ember',
                          weaponIds.includes(weapon.id) ? 'border-ember ring-2 ring-orange-100' : 'border-stone-200',
                        )}
                      >
                        <strong className="block text-base font-black text-ink">{weapon.name}</strong>
                        <span className="mt-2 block text-sm font-bold text-stone-700">
                          {weapon.harm} {fr.creator.damage}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1">
                          {weapon.tags.map((tag) => (
                            <span key={tag} className="rounded bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600">
                              {tag}
                            </span>
                          ))}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <NextButton onClick={() => setStep(5)} disabled={!canFinish} />
        </StepShell>
      ) : null}

      {step === 5 ? (
        <StepShell title={fr.creator.links} description={fr.creator.linksDescription}>
          <div className="grid gap-4 max-w-2xl">
            {playbook.histories.map((prompt, i) => (
              <div key={i} className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
                <p className="text-sm leading-6 text-stone-700">{prompt}</p>
                <input
                  value={hunterLinks[i] ?? ''}
                  onChange={(event) => setHunterLinks((prev) => ({ ...prev, [i]: event.target.value }))}
                  placeholder={fr.creator.linkHunterPlaceholder}
                  className="mt-3 min-h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-bold text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
                />
              </div>
            ))}
          </div>
          <NextButton onClick={() => setStep(hasSection ? 6 : 7)} disabled={false} />
        </StepShell>
      ) : null}

      {step === 6 && hasSection ? (
        <StepShell title={fr.creator.playbookSection} description={fr.creator.playbookSectionDescription}>
          <div className="max-w-2xl">
            <PlaybookSectionPicker
              playbook={playbook}
              choices={playbookSection}
              onChange={setPlaybookSection}
            />
            <NextButton
              onClick={() => setStep(7)}
              disabled={!isSectionValid(playbook, playbookSection)}
            />
          </div>
        </StepShell>
      ) : null}

      {step === 7 ? (
        <StepShell title={fr.creator.history} description={fr.creator.historyDescription}>
          <div className="max-w-2xl">
            <textarea
              value={history}
              onChange={(event) => setHistory(event.target.value)}
              autoFocus
              rows={10}
              className="w-full resize-none rounded-md border border-stone-300 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
              placeholder={fr.sheet.historyPlaceholder}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-stone-400">{history.length > 0 ? `${history.length} caractères` : ""}</span>
              <button
                type="button"
                onClick={finish}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ember px-5 py-2 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                {fr.creator.createCharacter}
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        </StepShell>
      ) : null}
    </main>
  );
}

function StepShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5">
        <h1 className="text-3xl font-black text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function NextButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
    >
      {fr.creator.continue}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
