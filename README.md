# 🫧 Jelly Surprise 2026

A cozy creature evolution game where players collect elemental essences and evolve into random surprise creatures.

## Game Vision

**Jelly Surprise** is a movement-based collection game where you:
- Control a jelly creature with arrow keys/WASD
- Explore a 2D world collecting floating essence orbs
- Fill your evolution bar as you collect
- Experience surprise transformations into random creatures
- Discover and catalog all creature forms

**NOT a match-3 game** - this is a top-down movement/collection game.

## Core Mechanics

1. **Player Movement**: Smooth 4-direction movement (arrow keys/WASD)
2. **Essence Collection**: 5 elemental types (Fire 🔴, Water 🔵, Sky ⚪, Forest 🟢, Mystic 🟣)
3. **Evolution Bar**: Fills as you collect essences
4. **Surprise Evolution**: Random creature transformation when bar fills
5. **Creature Catalog**: Track all discovered evolutions
6. **Save System**: Progress persists via localStorage

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
│   ├── main.ts       # Game entry point
│   ├── scenes/       # Game scenes
│   ├── entities/     # Player, essences, creatures
│   └── ui/           # UI components
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

## Phase Roadmap

### Phase 1: Foundation (Current)
- [ ] Player movement with arrow keys/WASD
- [ ] Essence orb spawning and collection
- [ ] Evolution bar UI
- [ ] Basic creature evolution
- [ ] GitHub Pages deployment

### Phase 2: Mystery Evolution
- [ ] 5 elemental essence types
- [ ] Random evolution system (weighted by essence types)
- [ ] Evolution surprise modal
- [ ] 5+ creature implementations

### Phase 3: Collection & Progress
- [ ] Creature catalog UI
- [ ] Locked/unlocked creature tracking
- [ ] Save/load system (localStorage)
- [ ] Progress persistence
# CDN refresh trigger
