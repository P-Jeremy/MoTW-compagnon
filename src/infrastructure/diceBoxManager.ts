import DiceBox, { type DieResult } from '@3d-dice/dice-box';

let _initPromise: Promise<DiceBox> | null = null;

export function getDiceBox(): Promise<DiceBox> {
  if (!_initPromise) {
    _initPromise = new Promise((resolve, reject) => {
      const box = new DiceBox('#dice-box', {
        assetPath: '/assets/dice-box/',
        spinForce: 5,
        throwForce: 8,
        startingHeight: 10,
        settleTimeout: 5000,
        lightIntensity: 1,
        enableShadows: true,
        theme: 'default',
        scale: 9,
      });
      box.init().then(() => {
        // Re-measure after init so the physics world matches the full-screen
        // canvas dimensions (CSS may not have painted during init).
        box.resizeWorld();
        resolve(box);
      }).catch(reject);
    });
  }
  return _initPromise;
}

export async function rollDice(notation: string, themeColor?: string): Promise<DieResult[]> {
  const box = await getDiceBox();
  box.updateConfig({ themeColor: themeColor ?? '' });
  const container = document.getElementById('dice-box');
  if (container) container.style.pointerEvents = 'auto';

  const results = await box.roll(notation);

  // Dice have settled — schedule auto-dismiss after 10 s or on any click
  let dismissTimer: ReturnType<typeof setTimeout>;

  function dismiss() {
    clearTimeout(dismissTimer);
    document.removeEventListener('click', dismiss, true);
    box.clear();
    if (container) container.style.pointerEvents = 'none';
  }

  dismissTimer = setTimeout(dismiss, 10_000);
  document.addEventListener('click', dismiss, { once: true, capture: true });

  return results;
}

// Kick off initialization in the background as early as possible
getDiceBox().catch(() => {
  // If init fails (e.g. missing assets in dev), reset so it can be retried
  _initPromise = null;
});
