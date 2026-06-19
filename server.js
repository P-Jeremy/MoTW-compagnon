import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'characters.json');
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/characters', (_req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(fs.readFileSync(DATA_FILE, 'utf-8'));
});

function readCharacters() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeCharacters(characters) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2), 'utf-8');
}

app.post('/api/characters', (req, res) => {
  const characters = readCharacters();
  characters.push(req.body);
  writeCharacters(characters);
  res.json({ ok: true });
});

app.put('/api/characters/:id', (req, res) => {
  const characters = readCharacters();
  const index = characters.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'not found' });
  characters[index] = req.body;
  writeCharacters(characters);
  res.json({ ok: true });
});

app.delete('/api/characters/:id', (req, res) => {
  const characters = readCharacters();
  const filtered = characters.filter((c) => c.id !== req.params.id);
  if (filtered.length === characters.length) return res.status(404).json({ error: 'not found' });
  writeCharacters(filtered);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`MOTW Companion running on http://localhost:${PORT}`);
});
