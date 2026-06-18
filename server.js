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

app.post('/api/characters', (req, res) => {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`MOTW Companion running on http://localhost:${PORT}`);
});
