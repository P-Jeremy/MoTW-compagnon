# Monster of the Week — Compagnon de jeu

Application web pour gérer les fiches de personnage à **Monster of the Week**.

## Fonctionnalités

- **12 livrets** : L'Élu, Le Vaurien, Le Divin, L'Expert, L'Initié, Le Monstre, L'Ordinaire, Le Parano, Le Professionnel, Le Magicien, L'Épouvantail, Le Vengeur
- Lancer de dés intégré (stats : Charme, Cool, Futé, Coriace, Bizarre)
- XP coché automatiquement sur un jet raté (≤ 6)
- Avancements interactifs, dont les manœuvres de base avancées (+1 au jet)
- Section spécifique à chaque livret (Destin, Mission, Magie de combat…)
- Export / import des fiches en JSON
- Sauvegarde automatique (partagée entre tous les joueurs connectés)

---

## Utilisation en local

### 1. Installer Node.js

Télécharge et installe **Node.js** (version 20 ou plus récente) depuis [nodejs.org](https://nodejs.org/fr).

### 2. Télécharger l'application

Clone le dépôt ou télécharge le ZIP depuis GitHub, puis ouvre un terminal dans le dossier du projet.

### 3. Lancer en mode développement

```bash
npm run dev:full
```

Lance simultanément le serveur Express (port `3000`) et Vite (port `5173`). Ouvre ensuite [http://localhost:5173](http://localhost:5173) dans ton navigateur.

---

## Hébergement sur un serveur (multijoueur)

Les personnages sont stockés dans un fichier JSON côté serveur — tous les joueurs connectés voient les mêmes fiches en temps réel.

### 1. Installer les dépendances

```bash
npm install
```

### 2. Builder le front

```bash
npm run build
```

### 3. Lancer le serveur

```bash
npm start
```

Par défaut sur le port `3000`. Pour changer de port :

```bash
PORT=8080 npm start
```

> Le fichier `data/characters.json` est créé automatiquement au premier lancement. Il persiste entre les redémarrages — ne pas le supprimer.

---

## Ressources

- [Monster of the Week — Dead Crows Studio](https://www.deadcrows.net/studio-deadcrows/monster-of-the-week/telechargements/) — règles et fiches officielles

---

## Stack technique

React 19 · TypeScript 5.8 · Vite 5 · Tailwind CSS 3.4 · Express
