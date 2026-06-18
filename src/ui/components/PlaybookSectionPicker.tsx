import type { Playbook, PlaybookOption } from '../../domain/types';
import { cn } from '../lib/cn';
import fr from '../../data/locales/fr.json';

interface PlaybookSectionPickerProps {
  playbook: Playbook;
  choices: Record<string, string | string[]>;
  onChange: (choices: Record<string, string | string[]>) => void;
}

export function PlaybookSectionPicker({ playbook, choices, onChange }: PlaybookSectionPickerProps) {
  function set(key: string, value: string | string[]) {
    onChange({ ...choices, [key]: value });
  }

  function toggleString(key: string, value: string, max: number) {
    const current = (choices[key] as string[] | undefined) ?? [];
    if (current.includes(value)) {
      set(key, current.filter((v) => v !== value));
    } else if (current.length < max) {
      set(key, [...current, value]);
    }
  }

  function toggleId(key: string, id: string, max: number) {
    toggleString(key, id, max);
  }

  if (playbook.destiny) {
    const { destiny } = playbook;
    return (
      <div className="grid gap-6">
        <StringRadio
          label={fr.playbookSection.destiny.discovery}
          options={destiny.discoveryOptions}
          value={choices['destinyDiscovery'] as string | undefined}
          onChange={(v) => set('destinyDiscovery', v)}
        />
        <StringCheckboxes
          label={fr.playbookSection.destiny.heroism}
          options={destiny.heroism}
          values={(choices['destinyHeroism'] as string[]) ?? []}
          max={3}
          onToggle={(v) => toggleString('destinyHeroism', v, 3)}
        />
        <StringRadio
          label={fr.playbookSection.destiny.ruin}
          options={destiny.ruin}
          value={choices['destinyRuin'] as string | undefined}
          onChange={(v) => set('destinyRuin', v)}
        />
      </div>
    );
  }

  if (playbook.background) {
    const backgroundMoves = playbook.background.from
      .map((id) => playbook.moves.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));
    return (
      <ItemRadio
        label={fr.playbookSection.background}
        options={backgroundMoves}
        value={choices['background'] as string | undefined}
        onChange={(id) => set('background', id)}
      />
    );
  }

  if (playbook.mission) {
    return (
      <StringRadio
        label={fr.playbookSection.mission}
        options={playbook.mission.options}
        value={choices['mission'] as string | undefined}
        onChange={(v) => set('mission', v)}
      />
    );
  }

  if (playbook.refuge) {
    return (
      <ItemCheckboxes
        label={fr.playbookSection.refuge}
        options={playbook.refuge.options}
        values={(choices['refuge'] as string[]) ?? []}
        max={playbook.refuge.choose}
        onToggle={(id) => toggleId('refuge', id, playbook.refuge!.choose)}
      />
    );
  }

  if (playbook.sect) {
    return (
      <div className="grid gap-6">
        <StringCheckboxes
          label={fr.playbookSection.sectGoodTraditions}
          options={playbook.sect.goodTraditions.options}
          values={(choices['sectGoodTraditions'] as string[]) ?? []}
          max={playbook.sect.goodTraditions.choose}
          onToggle={(v) => toggleString('sectGoodTraditions', v, playbook.sect!.goodTraditions.choose)}
        />
        <StringCheckboxes
          label={fr.playbookSection.sectBadTraditions}
          options={playbook.sect.badTraditions.options}
          values={(choices['sectBadTraditions'] as string[]) ?? []}
          max={playbook.sect.badTraditions.choose}
          onToggle={(v) => toggleString('sectBadTraditions', v, playbook.sect!.badTraditions.choose)}
        />
      </div>
    );
  }

  if (playbook.species) {
    const base = (choices['naturalAttacksBase'] as string[]) ?? [];
    const supplementary = (choices['naturalAttacksSupplementary'] as string[]) ?? [];
    return (
      <div className="grid gap-6">
        <ItemRadio
          label={fr.playbookSection.curse}
          options={playbook.species.curseOptions}
          value={choices['curse'] as string | undefined}
          onChange={(id) => set('curse', id)}
        />
        <ItemCheckboxes
          label={fr.playbookSection.naturalAttacks}
          options={playbook.species.naturalAttacks.base}
          values={base}
          max={playbook.species.naturalAttacks.base.length}
          onToggle={(id) => set('naturalAttacksBase', base.includes(id) ? base.filter((v) => v !== id) : [...base, id])}
        />
        <div>
          <h3 className="mb-3 text-sm font-bold text-stone-700">{fr.playbookSection.naturalAttacksModifiers}</h3>
          <div className="grid gap-2">
            {playbook.species.naturalAttacks.supplementary.map((s) => {
              const checked = supplementary.includes(s.id);
              return (
                <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 p-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      set(
                        'naturalAttacksSupplementary',
                        checked ? supplementary.filter((v) => v !== s.id) : [...supplementary, s.id],
                      )
                    }
                    className="h-4 w-4 rounded border-stone-300 accent-steel"
                  />
                  <span className="text-sm font-bold">{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (playbook.agency) {
    return (
      <div className="grid gap-6">
        <StringCheckboxes
          label={fr.playbookSection.agencyResources}
          options={playbook.agency.resources.options}
          values={(choices['agencyResources'] as string[]) ?? []}
          max={playbook.agency.resources.choose}
          onToggle={(v) => toggleString('agencyResources', v, playbook.agency!.resources.choose)}
        />
        <StringCheckboxes
          label={fr.playbookSection.agencyAdmin}
          options={playbook.agency.administration.options}
          values={(choices['agencyAdmin'] as string[]) ?? []}
          max={playbook.agency.administration.choose}
          onToggle={(v) => toggleString('agencyAdmin', v, playbook.agency!.administration.choose)}
        />
      </div>
    );
  }

  if (playbook.combatMagic) {
    const { combatMagic } = playbook;
    const selectedBase = (choices['combatMagicBase'] as string[]) ?? [];
    const selectedEffects = (choices['combatMagicEffects'] as string[]) ?? [];
    const totalSelected = selectedBase.length + selectedEffects.length;
    const canAddMore = totalSelected < combatMagic.choose;
    return (
      <div className="grid gap-6">
        <p className="text-sm text-stone-600">{fr.playbookSection.combatMagic} ({totalSelected}/{combatMagic.choose})</p>
        <div>
          <h3 className="mb-3 text-sm font-bold text-stone-700">{fr.playbookSection.combatMagicBase}</h3>
          <div className="grid gap-2">
            {combatMagic.base.map((opt) => {
              const checked = selectedBase.includes(opt.id);
              const disabled = !checked && !canAddMore;
              return (
                <label
                  key={opt.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    checked && 'border-steel bg-steel/10',
                    !checked && !disabled && 'border-stone-200',
                    disabled && 'cursor-not-allowed border-stone-100 opacity-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() =>
                      set(
                        'combatMagicBase',
                        checked ? selectedBase.filter((v) => v !== opt.id) : [...selectedBase, opt.id],
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-steel"
                  />
                  <div>
                    <p className="text-sm font-bold">{opt.name}</p>
                    {opt.harm !== undefined ? (
                      <p className="text-xs text-stone-500">{opt.harm} {opt.harm > 1 ? fr.playbookSection.harmPlural : fr.playbookSection.harmSingular} · {opt.tags?.join(', ')}</p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-stone-700">{fr.playbookSection.combatMagicEffects}</h3>
          <div className="grid gap-2">
            {combatMagic.effects.map((opt) => {
              const checked = selectedEffects.includes(opt.id);
              const disabled = !checked && !canAddMore;
              return (
                <label
                  key={opt.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    checked && 'border-steel bg-steel/10',
                    !checked && !disabled && 'border-stone-200',
                    disabled && 'cursor-not-allowed border-stone-100 opacity-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() =>
                      set(
                        'combatMagicEffects',
                        checked ? selectedEffects.filter((v) => v !== opt.id) : [...selectedEffects, opt.id],
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-steel"
                  />
                  <div>
                    <p className="text-sm font-bold">{opt.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500">{opt.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (playbook.darkSide) {
    return (
      <StringCheckboxes
        label={fr.playbookSection.darkSide}
        options={playbook.darkSide.options}
        values={(choices['darkSideTraits'] as string[]) ?? []}
        max={playbook.darkSide.chooseTraits}
        onToggle={(v) => toggleString('darkSideTraits', v, playbook.darkSide!.chooseTraits)}
      />
    );
  }

  if (playbook.prey) {
    return (
      <div className="grid gap-6">
        <StringRadio
          label={fr.playbookSection.preyLoss}
          options={playbook.prey.lossOptions}
          value={choices['preyLoss'] as string | undefined}
          onChange={(v) => set('preyLoss', v)}
        />
        <StringRadio
          label={fr.playbookSection.preyWhy}
          options={playbook.prey.whyFailed}
          value={choices['preyWhy'] as string | undefined}
          onChange={(v) => set('preyWhy', v)}
        />
      </div>
    );
  }

  return null;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StringRadio({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-stone-700">{label}</h3>
      <div className="grid gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
              value === opt ? 'border-steel bg-steel/10' : 'border-stone-200 hover:border-stone-400',
            )}
          >
            <input
              type="radio"
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="h-4 w-4 accent-steel"
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StringCheckboxes({
  label,
  options,
  values,
  max,
  onToggle,
}: {
  label: string;
  options: string[];
  values: string[];
  max: number;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-stone-700">{label}</h3>
      <div className="grid gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt);
          const disabled = !checked && values.length >= max;
          return (
            <label
              key={opt}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                checked && 'border-steel bg-steel/10',
                !checked && !disabled && 'border-stone-200 hover:border-stone-400',
                disabled && 'cursor-not-allowed border-stone-100 opacity-50',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(opt)}
                className="h-4 w-4 accent-steel"
              />
              <span className="text-sm">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ItemRadio({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: PlaybookOption[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-stone-700">{label}</h3>
      <div className="grid gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
              value === opt.id ? 'border-steel bg-steel/10' : 'border-stone-200 hover:border-stone-400',
            )}
          >
            <input
              type="radio"
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="mt-0.5 h-4 w-4 accent-steel"
            />
            <div>
              <p className="text-sm font-bold">{opt.name}</p>
              {opt.description ? <p className="mt-0.5 text-xs leading-5 text-stone-500">{opt.description}</p> : null}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function ItemCheckboxes({
  label,
  options,
  values,
  max,
  onToggle,
}: {
  label: string;
  options: PlaybookOption[];
  values: string[];
  max: number;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-stone-700">{label}</h3>
      <div className="grid gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt.id);
          const disabled = !checked && values.length >= max;
          return (
            <label
              key={opt.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                checked && 'border-steel bg-steel/10',
                !checked && !disabled && 'border-stone-200 hover:border-stone-400',
                disabled && 'cursor-not-allowed border-stone-100 opacity-50',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(opt.id)}
                className="mt-0.5 h-4 w-4 accent-steel"
              />
              <div>
                <p className="text-sm font-bold">{opt.name}</p>
                {opt.description ? <p className="mt-0.5 text-xs leading-5 text-stone-500">{opt.description}</p> : null}
                {opt.harm !== undefined ? (
                  <p className="mt-0.5 text-xs text-stone-400">{opt.harm} {opt.harm > 1 ? fr.playbookSection.harmPlural : fr.playbookSection.harmSingular} · {opt.tags?.join(', ')}</p>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
