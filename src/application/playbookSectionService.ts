import type { Playbook } from '../domain/types';

export function hasPlaybookSection(playbook: Playbook): boolean {
  return !!(
    playbook.destiny ||
    playbook.background ||
    playbook.mission ||
    playbook.refuge ||
    playbook.sect ||
    playbook.species ||
    playbook.agency ||
    playbook.combatMagic ||
    playbook.darkSide ||
    playbook.prey
  );
}

export function isSectionValid(
  playbook: Playbook,
  choices: Record<string, string | string[]>,
): boolean {
  if (playbook.combatMagic) {
    const base = (choices["combatMagicBase"] as string[] | undefined) ?? [];
    const effects = (choices["combatMagicEffects"] as string[] | undefined) ?? [];
    return (
      base.length >= playbook.combatMagic.minBase &&
      base.length + effects.length === playbook.combatMagic.choose
    );
  }
  return true;
}
