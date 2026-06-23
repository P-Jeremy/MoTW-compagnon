import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { updateText } from '@automerge/automerge';
import type { AutomergeUrl, DocHandle } from '@automerge/automerge-repo';
import { useDocHandle, useDocument, usePresence } from '@automerge/automerge-repo-react-hooks';
import type { Character, DiceRoll, Move, Playbook } from '../../domain/types';
import { getIdentity, type UserIdentity } from '../../infrastructure/identity';
import { formatModifier, statLabels, statOrder } from '../../domain/statLabels';
import { Tracker } from './Tracker';
import { MoveCard } from './MoveCard';
import fr from '../../data/locales/fr.json';
import { basicMoves } from '../../application/basicMoveService';
import { HunterReference } from './HunterReference';
import { getAdvancementType, getAvailableAdvancements } from '../../application/advancementTypeService';
import { MovePicker } from './MovePicker';
import { BasicMovePicker } from './BasicMovePicker';
import { PlaybookSectionPicker } from './PlaybookSectionPicker';
import { hasPlaybookSection } from '../../application/playbookSectionService';

interface CharacterSheetContainerProps {
  url: AutomergeUrl;
  playbook: Playbook;
  onBack: () => void;
  onDelete: () => void;
}

/**
 * Loads the character's Automerge document + handle, then renders the sheet.
 * Edits flow through `changeDoc` (CRDT mutations) so concurrent editors merge
 * instead of overwriting each other.
 */
export function CharacterSheetContainer({ url, playbook, onBack, onDelete }: CharacterSheetContainerProps) {
  const [character, changeDoc] = useDocument<Character>(url, { suspense: false });
  const handle = useDocHandle<Character>(url, { suspense: false });

  if (!character || !handle) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 text-center">
        <p className="text-sm font-bold text-stone-500">{fr.app.loading}</p>
      </main>
    );
  }

  return (
    <CharacterSheet
      character={character}
      playbook={playbook}
      handle={handle}
      onBack={onBack}
      onDelete={onDelete}
      onChange={changeDoc}
    />
  );
}

interface CharacterSheetProps {
  character: Character;
  playbook: Playbook;
  handle: DocHandle<Character>;
  onBack: () => void;
  onDelete: () => void;
  onChange: (recipe: (doc: Character) => void) => void;
}

function CharacterSheet({ character, playbook, handle, onBack, onDelete, onChange }: CharacterSheetProps) {
  const [rolls, setRolls] = useState<Record<string, DiceRoll>>({});
  const identity = useMemo(() => getIdentity(), []);
  const { peerStates } = usePresence<{ user: UserIdentity }>({
    handle,
    initialState: { user: identity },
  });
  const peers = useMemo(() => {
    const byUser = new Map<string, UserIdentity>();
    for (const peer of Object.values(peerStates.getStates())) {
      const user = peer.value?.user;
      if (user?.userId && user.userId !== identity.userId) byUser.set(user.userId, user);
    }
    return Array.from(byUser.values());
  }, [peerStates, identity.userId]);
  const [activeTab, setActiveTab] = useState<'sheet' | 'moves' | 'reference' | 'advancements'>('sheet');
  const [pendingAdvancement, setPendingAdvancement] = useState<{
    text: string;
    isAdvanced: boolean;
  } | null>(null);
  const [markBasicMovesFor, setMarkBasicMovesFor] = useState<{
    text: string;
    isAdvanced: boolean;
  } | null>(null);
  const [editingSection, setEditingSection] = useState(false);
  const [xpNotice, setXpNotice] = useState(false);

  const galonsTaken = character.galonsTaken ?? (character.advancementsTaken.length + character.advancedAdvancementsTaken.length);
  const advancedUnlocked = galonsTaken >= 5;
  const hasGalonAvailable = character.xp.current >= character.xp.max;

  function applyGalon(mutate: (doc: Character) => void) {
    onChange((doc) => {
      doc.xp.current = 0;
      doc.galonsTaken = (doc.galonsTaken ?? 0) + 1;
      mutate(doc);
    });
  }

  function takeAdvancement(advancement: string) {
    const type = getAdvancementType(advancement);
    if (type.kind === 'move-same' || type.kind === 'move-other') {
      setPendingAdvancement({ text: advancement, isAdvanced: false });
      return;
    }
    if (type.kind === 'mark-basic-moves') {
      setMarkBasicMovesFor({ text: advancement, isAdvanced: false });
      return;
    }
    applyGalon((doc) => {
      if (type.kind === 'luck') doc.luck.current = Math.min(doc.luck.current + 1, doc.luck.max);
      if (type.kind === 'stat') doc.stats[type.stat] += type.bonus;
      doc.advancementsTaken.push(advancement);
    });
  }

  function takeAdvancedAdvancement(advancement: string) {
    if (!advancedUnlocked) return;
    const type = getAdvancementType(advancement);
    if (type.kind === 'move-same' || type.kind === 'move-other') {
      setPendingAdvancement({ text: advancement, isAdvanced: true });
      return;
    }
    if (type.kind === 'mark-basic-moves') {
      setMarkBasicMovesFor({ text: advancement, isAdvanced: true });
      return;
    }
    applyGalon((doc) => {
      if (type.kind === 'luck') doc.luck.current = Math.min(doc.luck.current + 1, doc.luck.max);
      if (type.kind === 'stat') doc.stats[type.stat] += type.bonus;
      doc.advancedAdvancementsTaken.push(advancement);
    });
  }

  function confirmMoveAdvancement(moveId: string) {
    if (!pendingAdvancement) return;
    const { isAdvanced, text } = pendingAdvancement;
    applyGalon((doc) => {
      doc.moves.push(moveId);
      if (isAdvanced) doc.advancedAdvancementsTaken.push(text);
      else doc.advancementsTaken.push(text);
    });
    setPendingAdvancement(null);
  }

  function confirmMarkBasicMoves(moveIds: string[]) {
    if (!markBasicMovesFor) return;
    const { isAdvanced, text } = markBasicMovesFor;
    applyGalon((doc) => {
      for (const id of moveIds) doc.advancedBasicMoves.push(id);
      if (isAdvanced) doc.advancedAdvancementsTaken.push(text);
      else doc.advancementsTaken.push(text);
    });
    setMarkBasicMovesFor(null);
  }

  const moves = useMemo(() => {
    const fixedIds = playbook.moveChoices.fixed ?? [];
    const backgroundId = typeof character.playbookSection?.background === 'string'
      ? character.playbookSection.background
      : undefined;
    const allIds = [...new Set([...fixedIds, ...(backgroundId ? [backgroundId] : []), ...character.moves])];
    return allIds
      .map((id) => playbook.moves.find((move) => move.id === id))
      .filter((move): move is Move => Boolean(move));
  }, [character.moves, character.playbookSection, playbook.moves, playbook.moveChoices.fixed]);

  function updateTracker(key: 'luck' | 'xp' | 'harm', value: number) {
    onChange((doc) => {
      doc[key].current = value;
    });
  }

  function updateWeaponName(weaponId: string, name: string) {
    onChange((doc) => {
      const index = doc.equipment.findIndex((weapon) => weapon.id === weaponId);
      if (index !== -1) updateText(doc, ['equipment', index, 'name'], name);
    });
  }

  function handleRoll(moveId: string, roll: DiceRoll) {
    setRolls((current) => ({ ...current, [moveId]: roll }));
    if (roll.tier === 'failure' && character.xp.current < character.xp.max) {
      onChange((doc) => {
        doc.xp.current = Math.min(doc.xp.current + 1, doc.xp.max);
      });
      setXpNotice(true);
      setTimeout(() => setXpNotice(false), 3000);
    }
  }

  function exportCharacter() {
    const json = JSON.stringify(character, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, '-').toLowerCase()}-motw.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pendingMoveMode = pendingAdvancement
    ? (getAdvancementType(pendingAdvancement.text).kind === 'move-same' ? 'same' : 'other') as 'same' | 'other'
    : null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-6 sm:px-6">
      {pendingAdvancement && pendingMoveMode && (
        <MovePicker
          mode={pendingMoveMode}
          currentPlaybookId={playbook.id}
          ownedMoveIds={character.moves}
          onSelect={confirmMoveAdvancement}
          onCancel={() => setPendingAdvancement(null)}
        />
      )}
      {markBasicMovesFor ? (
        <BasicMovePicker
          moves={basicMoves.filter((m) => !(character.advancedBasicMoves ?? []).includes(m.id))}
          count={2}
          onConfirm={confirmMarkBasicMoves}
          onCancel={() => setMarkBasicMovesFor(null)}
        />
      ) : null}
      <header className="mb-6 flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {fr.sheet.backToList}
        </button>
        <div className="flex items-center gap-2">
          <PresenceBadge peers={peers} />
          <button
            type="button"
            onClick={exportCharacter}
            aria-label={fr.sheet.export}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-ink"
          >
            <Download className="h-4 w-4" />
            {fr.sheet.export}
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={fr.sheet.deleteConfirm}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-white px-3 py-2 text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="mb-5 rounded-lg bg-ink p-5 text-white shadow-soft">
        <p className="text-sm font-bold text-orange-200">{playbook.name}</p>
        <input
          value={character.name}
          onChange={(event) => {
            const value = event.target.value;
            onChange((doc) => updateText(doc, ['name'], value));
          }}
          className="mt-1 min-h-12 w-full bg-transparent text-3xl font-black outline-none sm:text-4xl border-b-2 border-transparent focus:border-white/40 transition-colors"
        />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-200">{playbook.description}</p>
      </section>

      <div className="mb-5 flex gap-1 border-b border-stone-200">
        {(['sheet', 'moves', 'advancements', 'reference'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab
                ? 'border-ink text-ink'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab === 'sheet'
              ? 'Fiche'
              : tab === 'moves'
              ? 'Manœuvres'
              : tab === 'reference'
              ? 'Aide de jeu'
              : fr.sheet.advancementsTab}
          </button>
        ))}
      </div>

      {activeTab === 'sheet' ? (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid content-start gap-5">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">{fr.sheet.stats}</h2>
            <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-1">
              {statOrder.map((stat) => (
                <div key={stat} className="rounded-md bg-stone-100 p-2 text-center lg:flex lg:items-center lg:justify-between">
                  <span className="block text-xs font-bold text-stone-500 lg:text-sm">{statLabels[stat]}</span>
                  <span className="mt-1 block text-xl font-black text-ink lg:mt-0">
                    {formatModifier(character.stats[stat])}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 lg:grid-cols-1">
            <Tracker
              label={fr.sheet.luck}
              value={character.luck.current}
              max={character.luck.max}
              onChange={(value) => updateTracker('luck', value)}
              tone="luck"
            />
            <Tracker
              label={fr.sheet.xp}
              value={character.xp.current}
              max={character.xp.max}
              onChange={(value) => updateTracker('xp', value)}
              tone="xp"
            />
            {hasGalonAvailable ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {fr.sheet.galonAvailable}
              </div>
            ) : null}
            <Tracker
              label={fr.sheet.harm}
              value={character.harm.current}
              max={character.harm.max}
              onChange={(value) => updateTracker('harm', value)}
              tone="harm"
            />
          </div>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">{fr.sheet.gear}</h2>
            <div className="mt-3 grid gap-3">
              {character.equipment.map((weapon) => (
                <article key={weapon.id} className="rounded-md bg-stone-100 p-3">
                  <label className="block">
                    <span className="sr-only">{fr.sheet.weaponName}</span>
                    <input
                      value={weapon.name}
                      onChange={(event) => updateWeaponName(weapon.id, event.target.value)}
                      className="min-h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm font-black text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
                    />
                  </label>
                  <p className="mt-1 text-sm font-bold text-stone-700">
                    {weapon.harm} {fr.sheet.damage}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {weapon.tags.map((tag) => (
                      <span key={tag} className="rounded bg-white px-2 py-1 text-xs font-bold text-stone-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="grid content-start gap-5">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">{fr.sheet.history}</h2>
            <textarea
              value={character.history}
              onChange={(event) => {
                const value = event.target.value;
                onChange((doc) => updateText(doc, ['history'], value));
              }}
              className="mt-3 min-h-40 w-full resize-y rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-6 text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
              placeholder={fr.sheet.historyPlaceholder}
            />
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">{fr.sheet.notes}</h2>
            <textarea
              value={character.notes}
              onChange={(event) => {
                const value = event.target.value;
                onChange((doc) => updateText(doc, ['notes'], value));
              }}
              className="mt-3 min-h-40 w-full resize-y rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-6 text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
              placeholder={fr.sheet.notesPlaceholder}
            />
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">{fr.sheet.links}</h2>
            <div className="mt-3 grid gap-3">
              {playbook.histories.map((prompt, i) => {
                const link = character.links.find((l) => l.prompt === prompt);
                return (
                  <div key={i}>
                    <p className="text-xs leading-5 text-stone-500">{prompt}</p>
                    <input
                      value={link?.hunterName ?? ''}
                      onChange={(event) => {
                        const hunterName = event.target.value;
                        onChange((doc) => {
                          const index = doc.links.findIndex((l) => l.prompt === prompt);
                          if (hunterName) {
                            if (index !== -1) updateText(doc, ['links', index, 'hunterName'], hunterName);
                            else doc.links.push({ prompt, hunterName });
                          } else if (index !== -1) {
                            doc.links.splice(index, 1);
                          }
                        });
                      }}
                      placeholder={fr.sheet.linkHunterPlaceholder}
                      className="mt-1 min-h-9 w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-1 text-sm font-bold text-ink outline-none focus:border-ember focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {hasPlaybookSection(playbook) ? (
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">Background</h2>
                <button
                  type="button"
                  onClick={() => setEditingSection((v) => !v)}
                  className="text-sm font-bold text-ember hover:underline"
                >
                  {editingSection ? fr.playbookSection.close : fr.playbookSection.configure}
                </button>
              </div>
              {editingSection ? (
                <PlaybookSectionPicker
                  playbook={playbook}
                  choices={character.playbookSection}
                  onChange={(section) => onChange((doc) => { doc.playbookSection = section; })}
                />
              ) : Object.keys(character.playbookSection).length === 0 ? (
                <button
                  type="button"
                  onClick={() => setEditingSection(true)}
                  className="w-full rounded-lg border-2 border-dashed border-stone-300 p-4 text-sm text-stone-400 hover:border-ember hover:text-ember"
                >
                  {fr.playbookSection.notConfigured}
                </button>
              ) : (
                <PlaybookSectionSummary choices={character.playbookSection} playbook={playbook} />
              )}
            </section>
          ) : null}
        </div>
      </div>
      ) : activeTab === 'moves' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="grid content-start gap-6">
            <div>
              <h2 className="mb-3 text-xl font-black text-ink">{fr.sheet.playbookMoves} {playbook.name}</h2>
              <div className="grid gap-4">
                {moves.map((move) => (
                  <MoveCard
                    key={move.id}
                    move={move}
                    stats={character.stats}
                    lastRoll={rolls[move.id]}
                    onRoll={(roll) => handleRoll(move.id, roll)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="grid content-start gap-6">
            <div>
              <h2 className="mb-3 text-xl font-black text-ink">{fr.sheet.basicMoves}</h2>
              <div className="grid gap-4">
                {basicMoves.map((move) => (
                  <MoveCard
                    key={move.id}
                    move={move}
                    stats={character.stats}
                    lastRoll={rolls[move.id]}
                    onRoll={(roll) => handleRoll(move.id, roll)}
                    extraBonus={(character.advancedBasicMoves ?? []).includes(move.id) ? 1 : 0}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === 'advancements' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">{fr.sheet.advancementsTab}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {hasGalonAvailable
                ? 'Vous avez un galon. Choisissez une amélioration et réinitialisez vos cases.'
                : `Vous avez ${character.xp.current}/${character.xp.max} galons. Cochez cinq cases pour prendre un galon.`}
            </p>
            <p className="mt-3 text-sm font-semibold text-stone-700">
              {`Galons pris : ${galonsTaken}`}
            </p>

            {hasGalonAvailable ? (
              <div className="mt-5 grid gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Avancement</h3>
                  <div className="mt-3 grid gap-2">
                    {getAvailableAdvancements(playbook.advancements, character.advancementsTaken).map((advancement, index) => (
                      <button
                        key={`${advancement}-${index}`}
                        type="button"
                        onClick={() => takeAdvancement(advancement)}
                        className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-ember hover:bg-ember/10"
                      >
                        {advancement}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">Avancement avancé</h3>
                  <div className="mt-3 grid gap-2">
                    {getAvailableAdvancements(playbook.advancedAdvancements, character.advancedAdvancementsTaken).map((advancement, index) => (
                      <button
                        key={`${advancement}-${index}`}
                        type="button"
                        onClick={() => takeAdvancedAdvancement(advancement)}
                        disabled={!advancedUnlocked}
                        className={`w-full rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${advancedUnlocked ? 'border-stone-200 bg-stone-50 text-ink hover:border-ember hover:bg-ember/10' : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                      >
                        {advancement}
                      </button>
                    ))}
                  </div>
                  {!advancedUnlocked ? (
                    <p className="mt-3 text-sm text-stone-500">Vous devez prendre {5 - galonsTaken} autres galons pour débloquer ces options.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">Choix pris</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">Améliorations</h3>
                {character.advancementsTaken.length === 0 ? (
                  <p className="mt-3 text-sm text-stone-500">Aucune amélioration prise pour l'instant.</p>
                ) : (
                  <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-stone-700">
                    {character.advancementsTaken.map((advancement, index) => (
                      <li key={`${advancement}-${index}`}>{advancement}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">Améliorations avancées</h3>
                {character.advancedAdvancementsTaken.length === 0 ? (
                  <p className="mt-3 text-sm text-stone-500">Aucune amélioration avancée prise pour l'instant.</p>
                ) : (
                  <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-stone-700">
                    {character.advancedAdvancementsTaken.map((advancement, index) => (
                      <li key={`${advancement}-${index}`}>{advancement}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <HunterReference />
      )}
      {xpNotice ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ember px-4 py-3 text-sm font-bold text-white shadow-lg">
          {fr.sheet.xpAutoTick}
        </div>
      ) : null}
    </main>
  );
}

function PresenceBadge({ peers }: { peers: UserIdentity[] }) {
  if (peers.length === 0) return null;
  return (
    <div className="flex items-center gap-2" title={`Aussi sur cette fiche : ${peers.map((p) => p.name).join(', ')}`}>
      <div className="flex -space-x-2">
        {peers.slice(0, 4).map((peer) => (
          <span
            key={peer.userId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-soft"
            style={{ backgroundColor: peer.color }}
          >
            {peer.name.slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>
      {peers.length > 4 ? <span className="text-xs font-bold text-stone-500">+{peers.length - 4}</span> : null}
    </div>
  );
}

function PlaybookSectionSummary({
  choices,
  playbook,
}: {
  choices: Record<string, string | string[]>;
  playbook: Playbook;
}) {
  const entries = Object.entries(choices).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  });

  if (entries.length === 0) return null;

  function sectionLabel(key: string): string {
    const locale = fr.playbookSection as Record<string, unknown>;
    const raw = typeof locale[key] === 'string' ? (locale[key] as string) : null;
    return (raw ?? key.replace(/([A-Z])/g, ' $1').trim()).replace(/s*(choisir d+.*?)$/, '');
  }

  function resolveValue(key: string, id: string): string {
    if (!playbook.species) return id;
    if (key === 'curse') return playbook.species.curseOptions.find((o) => o.id === id)?.name ?? id;
    if (key === 'naturalAttacksBase') return playbook.species.naturalAttacks.base.find((o) => o.id === id)?.name ?? id;
    if (key === 'naturalAttacksSupplementary') return playbook.species.naturalAttacks.supplementary.find((o) => o.id === id)?.name ?? id;
    return id;
  }

  return (
    <dl className="grid gap-3 text-sm">
      {entries.map(([key, value]) => {
        if (key === 'background' && typeof value === 'string') {
          const move = playbook.moves.find((m) => m.id === value);
          if (move) {
            return (
              <div key={key}>
                <dd className="font-bold text-stone-900">{move.name}</dd>
                {move.description && (
                  <dd className="mt-1 text-stone-500 text-xs">{move.description}</dd>
                )}
              </div>
            );
          }
        }
        const displayValue = Array.isArray(value)
          ? value.map((v) => resolveValue(key, v)).join(', ')
          : resolveValue(key, value);
        return (
          <div key={key}>
            <dt className="font-bold text-stone-900 capitalize">{sectionLabel(key)}</dt>
            <dd className="mt-1 text-stone-600">{displayValue}</dd>
          </div>
        );
      })}
    </dl>
  );
}
