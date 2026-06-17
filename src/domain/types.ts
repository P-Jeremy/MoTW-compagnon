export type StatKey = 'charm' | 'cool' | 'sharp' | 'tough' | 'weird';

export type Stats = Record<StatKey, number>;

export interface Tracker {
  current: number;
  max: number;
}

export interface MoveResult {
  success?: string;
  mixed?: string;
  failure?: string;
}

export interface Move {
  id: string;
  name: string;
  description: string;
  trigger?: string;
  rollStat?: StatKey;
  results?: MoveResult;
}

export interface Weapon {
  id: string;
  name: string;
  harm: number;
  tags: string[];
}

export interface StatArray {
  id: string;
  label: string;
  stats: Stats;
}

export interface GearChoice {
  id: string;
  label: string;
  options: Weapon[];
  choose: number;
}

export interface PlaybookOption {
  id: string;
  name: string;
  description?: string;
  harm?: number;
  tags?: string[];
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  statArrays: StatArray[];
  moves: Move[];
  moveChoices: {
    choose: number;
    from: string[];
    fixed?: string[];
  };
  gearChoices: GearChoice[];
  histories: string[];
  advancements: string[];
  advancedAdvancements: string[];
  // Sections playbook-spécifiques (optionnelles)
  destiny?: {
    discoveryOptions: string[];
    heroism: string[];
    ruin: string[];
  };
  background?: { choose: number; from: string[] };
  mission?: { options: string[] };
  refuge?: { choose: number; options: PlaybookOption[] };
  sect?: {
    goodTraditions: { choose: number; options: string[] };
    badTraditions: { choose: number; options: string[] };
  };
  species?: {
    curseOptions: PlaybookOption[];
    naturalAttacks: {
      base: PlaybookOption[];
      supplementary: Array<{ id: string; name: string }>;
    };
  };
  agency?: {
    resources: { choose: number; options: string[] };
    administration: { choose: number; options: string[] };
  };
  combatMagic?: {
    choose: number;
    minBase: number;
    base: PlaybookOption[];
    effects: Array<{ id: string; name: string; description: string }>;
  };
  darkSide?: { chooseTraits: number; options: string[] };
  prey?: { lossOptions: string[]; whyFailed: string[] };
}

export interface HunterLink {
  prompt: string;
  hunterName: string;
}

export interface Character {
  id: string;
  name: string;
  playbookId: string;
  stats: Stats;
  moves: string[];
  equipment: Weapon[];
  luck: Tracker;
  xp: Tracker;
  harm: Tracker;
  history: string;
  notes: string;
  links: HunterLink[];
  advancementsTaken: string[];
  advancedAdvancementsTaken: string[];
  galonsTaken: number;
  playbookSection: Record<string, string | string[]>;
  advancedBasicMoves: string[];
}

export interface DiceRoll {
  dieA: number;
  dieB: number;
  modifier: number;
  extraBonus?: number;
  stat?: StatKey;
  total: number;
  tier: 'success' | 'mixed' | 'failure';
}
