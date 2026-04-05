# Jelly Surprise 2026

A mystery evolution game where creatures evolve by collecting magical essences, built with Phaser 3, TypeScript, and Vite.

## Game Vision

Jelly Surprise is a mystery evolution game where players guide colorful creatures that evolve by collecting magical essences. Discover new creature forms through evolution, browse the creature catalog, and save your progress locally.

## Features

- **Mystery Evolution System**: Collect essences to evolve your creature through multiple tiers
- **Creature Catalog**: View all discovered creatures and their evolution stages
- **Save/Load System**: Progress automatically saved to localStorage
- **Smooth Controls**: WASD or Arrow key movement
- **Visual Feedback**: Floating text, animations, and evolution celebrations

## Tech Stack

- **Engine:** Phaser 3
- **Language:** TypeScript
- **Build:** Vite
- **Deploy:** GitHub Pages

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
jelly-surprise-2026/
├── src/              # TypeScript source files
│   └── main.ts       # Game entry point
├── public/           # Static assets
├── index.html       # HTML entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

The game runs on `http://localhost:5173` during development with hot module replacement.

## Deployment

Push to `main` branch to trigger automatic deployment to GitHub Pages.

Live URL: https://sidonsoft.github.io/jelly-surprise-2026/
