import { cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'node_modules', '@3d-dice', 'dice-box', 'dist');
const dest = join(root, 'public', 'assets', 'dice-box');

mkdirSync(dest, { recursive: true });

for (const file of ['Dice.js', 'world.offscreen.js', 'world.onscreen.js']) {
  cpSync(join(src, file), join(dest, file));
}

cpSync(join(src, 'assets', 'ammo'), join(dest, 'ammo'), { recursive: true });
cpSync(join(src, 'assets', 'themes'), join(dest, 'themes'), { recursive: true });

console.log('✓ dice-box assets copied to public/assets/dice-box/');
