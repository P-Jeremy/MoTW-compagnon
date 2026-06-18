import { Plus, Upload, UserRound } from 'lucide-react';
import { useRef } from 'react';
import type { Character, Playbook } from '../../domain/types';
import { normalizeCharacter } from '../../infrastructure/characterRepository';
import fr from '../../data/locales/fr.json';

interface CharacterListProps {
  characters: Character[];
  playbooks: Playbook[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onImport: (character: Character) => void;
}

export function CharacterList({ characters, playbooks, onCreate, onOpen, onImport }: CharacterListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galonsTakenLabel = 'Galons pris';

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Character;
        if (!data.name || !data.playbookId || !data.stats) return;
        onImport(normalizeCharacter({ ...data, id: crypto.randomUUID() }));
      } catch {
        // JSON invalide, on ignore
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ember">{fr.app.gameName}</p>
          <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">{fr.list.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft transition hover:bg-stone-50"
          >
            <Upload className="h-4 w-4" />
            {fr.list.import}
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            {fr.list.newShort}
          </button>
        </div>
      </header>

      {characters.length === 0 ? (
        <section className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center shadow-soft">
          <UserRound className="h-10 w-10 text-ember" />
          <h2 className="mt-4 text-xl font-black text-ink">{fr.list.emptyTitle}</h2>
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            {fr.list.newCharacter}
          </button>
        </section>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => {
            const playbook = playbooks.find((item) => item.id === character.playbookId);
            return (
              <button
                key={character.id}
                type="button"
                onClick={() => onOpen(character.id)}
                className="rounded-lg border border-stone-200 bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-ember"
              >
                <span className="text-sm font-bold text-ember">{playbook?.name ?? fr.list.unknownPlaybook}</span>
                <strong className="mt-2 block text-xl font-black text-ink">{character.name}</strong>
                <span className="mt-4 block text-sm text-stone-600">
                  {fr.list.harm} {character.harm.current}/{character.harm.max} · {fr.list.xp} {character.xp.current}/{character.xp.max}
                </span>
                <span className="mt-1 block text-sm text-stone-600">
                  {galonsTakenLabel} {character.galonsTaken ?? 0}
                </span>
              </button>
            );
          })}
        </section>
      )}
    </main>
  );
}
