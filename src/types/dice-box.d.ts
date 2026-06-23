declare module '@3d-dice/dice-box' {
  export interface DieResult {
    sides: number;
    value: number;
    groupId: number;
    rollId: number;
    theme: string;
  }

  export interface RollGroup {
    sides: number;
    qty: number;
    mods: unknown[];
    rolls: DieResult[];
    value: number;
  }

  export interface DiceBoxConfig {
    assetPath: string;
    container?: string;
    id?: string;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    angularDamping?: number;
    linearDamping?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    settleTimeout?: number;
    offscreen?: boolean;
    delay?: number;
    lightIntensity?: number;
    enableShadows?: boolean;
    shadowTransparency?: number;
    theme?: string;
    themeColor?: string;
    scale?: number;
    onRollComplete?: (results: RollGroup[]) => void;
    onDieComplete?: (result: DieResult) => void;
    onBeforeRoll?: (notation: unknown) => void;
    onThemeLoaded?: () => void;
    onThemeConfigLoaded?: (config: unknown) => void;
    onRemoveComplete?: () => void;
  }

  export default class DiceBox {
    constructor(container: string, config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string | string[]): Promise<DieResult[]>;
    add(notation: string | string[]): Promise<DieResult[]>;
    clear(): void;
    hide(): void;
    show(): void;
    updateConfig(config: Partial<DiceBoxConfig>): void;
    resizeWorld(): void;
  }
}
