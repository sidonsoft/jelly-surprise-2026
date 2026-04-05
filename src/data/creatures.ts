import type { CreatureDefinition } from '../types';

export const CREATURES: CreatureDefinition[] = [
  {
    id: 'slime',
    name: 'Slime',
    color: 0x00ff88,
    radius: 25,
    tier: 1,
    description: 'A friendly slime that loves collecting essence',
  },
  {
    id: 'jelly',
    name: 'Jelly',
    color: 0x00ccff,
    radius: 28,
    tier: 2,
    description: 'A wobbly jelly creature with more power',
  },
  {
    id: 'crystal',
    name: 'Crystal',
    color: 0xff00ff,
    radius: 32,
    tier: 2,
    description: 'A crystalline being with magical properties',
  },
  {
    id: 'dragon',
    name: 'Dragon',
    color: 0xff6600,
    radius: 38,
    tier: 3,
    description: 'A fierce dragon with overwhelming strength',
  },
  {
    id: 'void',
    name: 'Void',
    color: 0x6600ff,
    radius: 45,
    tier: 3,
    description: 'A mysterious void entity from another dimension',
  },
];

export const TIER1_CREATURES = CREATURES.filter(c => c.tier === 1);
export const TIER2_CREATURES = CREATURES.filter(c => c.tier === 2);
export const TIER3_CREATURES = CREATURES.filter(c => c.tier === 3);

export const DEFAULT_CREATURE = CREATURES[0];
