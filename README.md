# Monster of the Week — Compagnon de jeu

Application web pour gérer les fiches de personnage à **Monster of the Week**.

## Fonctionnalités

- **12 livrets** : L'Élu, Le Vaurien, Le Divin, L'Expert, L'Initié, Le Monstre, L'Ordinaire, Le Parano, Le Professionnel, Le Magicien, L'Épouvantail, Le Vengeur
- Lancer de dés intégré (stats : Charme, Cool, Futé, Coriace, Bizarre)
- XP coché automatiquement sur un jet raté (≤ 6)
- Avancements interactifs, dont les manœuvres de base avancées (+1 au jet)
- Section spécifique à chaque livret (Destin, Mission, Magie de combat…)
- Export / import des fiches en JSON
- **Édition collaborative en temps réel** : plusieurs joueurs peuvent modifier la même fiche simultanément sans écrasement (CRDT Automerge), avec indicateur de présence
- Fonctionne hors-ligne (cache local IndexedDB) puis se resynchronise à la reconnexion

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

Le serveur agit comme **pair de synchronisation CRDT** (Automerge) : il relaie les
modifications entre tous les clients connectés par WebSocket et persiste chaque fiche
sur disque. Deux joueurs peuvent éditer la même fiche en même temps — les changements
fusionnent automatiquement, sans conflit ni écrasement.

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

> Les documents Automerge sont stockés dans `data/automerge/` et l'identifiant du document
> racine dans `data/root.json`. Ces fichiers sont créés automatiquement au premier
> lancement et persistent entre les redémarrages — ne pas les supprimer.
>
> **Migration :** si un ancien `data/characters.json` est présent au premier démarrage,
> ses personnages sont importés automatiquement dans les documents Automerge.

---

## Ressources

- [Monster of the Week — Dead Crows Studio](https://www.deadcrows.net/studio-deadcrows/monster-of-the-week/telechargements/) — règles et fiches officielles

---

## Stack technique

React 19 · TypeScript 5.8 · Vite 5 · Tailwind CSS 3.4 · Express · Automerge 3 (CRDT) · WebSocket
