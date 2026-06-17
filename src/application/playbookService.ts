import ordinary from '../data/playbooks/ordinary.json';
import expert from '../data/playbooks/expert.json';
import monster from '../data/playbooks/monster.json';
import professional from '../data/playbooks/professional.json';
import divine from '../data/playbooks/divine.json';
import initiate from '../data/playbooks/initiate.json';
import spellSlinger from '../data/playbooks/spell-slinger.json';
import paranoid from '../data/playbooks/paranoid.json';
import wronged from '../data/playbooks/wronged.json';
import chosen from '../data/playbooks/chosen.json';
import crooked from '../data/playbooks/crooked.json';
import spooky from '../data/playbooks/spooky.json';
import type { Playbook } from '../domain/types';

export const playbooks: Playbook[] = [
  ordinary,
  expert,
  monster,
  professional,
  divine,
  initiate,
  spellSlinger,
  paranoid,
  wronged,
  chosen,
  crooked,
  spooky,
] as Playbook[];

export function getPlaybook(playbookId: string): Playbook | undefined {
  return playbooks.find((playbook) => playbook.id === playbookId);
}
