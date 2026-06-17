# Monster of the Week — Compagnon de jeu

Application web pour gérer les fiches de personnage à **Monster of the Week**.

## Fonctionnalités

- **12 livrets** : L'Élu, Le Vaurien, Le Divin, L'Expert, L'Initié, Le Monstre, L'Ordinaire, Le Parano, Le Professionnel, Le Magicien, L'Épouvantail, Le Vengeur
- Lancer de dés intégré (stats : Charme, Cool, Futé, Coriace, Bizarre)
- XP coché automatiquement sur un jet raté (≤ 6)
- Avancements interactifs, dont les manœuvres de base avancées (+1 au jet)
- Section spécifique à chaque livret (Destin, Mission, Magie de combat…)
- Export / import des fiches en JSON
- Sauvegarde automatique dans le navigateur

---

## Installation et démarrage

### 1. Installer Node.js

Télécharge et installe **Node.js** (version 20 ou plus récente) depuis [nodejs.org](https://nodejs.org/fr).

### 2. Télécharger l'application

Clone le dépôt ou télécharge le ZIP depuis GitHub, puis ouvre un terminal dans le dossier du projet.

### 3. Lancer l'application

```bash
npm install
npm run dev
```

Ouvre ensuite [http://localhost:5173](http://localhost:5173) dans ton navigateur.

> Les personnages sont sauvegardés dans la mémoire du navigateur. Utilise l'export JSON pour faire des sauvegardes ou partager une fiche.

---

## Ressources

- [Monster of the Week — Dead Crows Studio](https://www.deadcrows.net/studio-deadcrows/monster-of-the-week/telechargements/) — règles et fiches officielles

---

## Stack technique

React 19 · TypeScript 5.8 · Vite 5 · Tailwind CSS 3.4
