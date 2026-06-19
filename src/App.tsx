import { useEffect, useMemo, useState } from 'react';
import { playbooks, getPlaybook } from './application/playbookService';
import type { Character } from './domain/types';
import { loadCharacters, addCharacter, updateCharacter, deleteCharacter } from './infrastructure/characterRepository';
import { CharacterCreator } from './ui/components/CharacterCreator';
import { CharacterList } from './ui/components/CharacterList';
import { CharacterSheet } from './ui/components/CharacterSheet';
import fr from './data/locales/fr.json';

type View = 'list' | 'create' | 'sheet';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    loadCharacters().then((fromFile) => {
      setCharacters(fromFile ?? []);
    });
  }, []);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedId),
    [characters, selectedId],
  );
  const selectedPlaybook = selectedCharacter ? getPlaybook(selectedCharacter.playbookId) : undefined;

  function createCharacter(character: Character) {
    addCharacter(character);
    setCharacters((current) => [...current, character]);
    setSelectedId(character.id);
    setView('sheet');
  }

  function handleUpdateCharacter(character: Character) {
    updateCharacter(character);
    setCharacters((current) => current.map((item) => (item.id === character.id ? character : item)));
  }

  function deleteSelectedCharacter() {
    if (!selectedCharacter) return;
    const confirmed = window.confirm(`${fr.sheet.deleteConfirm} ${selectedCharacter.name} ?`);
    if (!confirmed) return;
    deleteCharacter(selectedCharacter.id);
    setCharacters((current) => current.filter((character) => character.id !== selectedCharacter.id));
    setSelectedId(null);
    setView('list');
  }

  function importCharacter(character: Character) {
    addCharacter(character);
    setCharacters((current) => [...current, character]);
    setSelectedId(character.id);
    setView('sheet');
  }

  if (view === 'create') {
    return <CharacterCreator playbooks={playbooks} onCancel={() => setView('list')} onCreate={createCharacter} />;
  }

  if (view === 'sheet' && selectedCharacter && selectedPlaybook) {
    return (
      <CharacterSheet
        character={selectedCharacter}
        playbook={selectedPlaybook}
        onBack={() => setView('list')}
        onDelete={deleteSelectedCharacter}
        onUpdate={handleUpdateCharacter}
      />
    );
  }

  return (
    <CharacterList
      characters={characters}
      playbooks={playbooks}
      onCreate={() => setView('create')}
      onOpen={(id) => {
        setSelectedId(id);
        setView('sheet');
      }}
      onImport={importCharacter}
    />
  );
}
