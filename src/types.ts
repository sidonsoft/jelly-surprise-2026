export interface CreatureDefinition {
  id: string;
  name: string;
  color: number;
  radius: number;
  tier: 1 | 2 | 3;
  description: string;
}

export interface CreatureState {
  currentCreature: CreatureDefinition;
  totalEssence: number;
  evolutionCount: number;
}

export interface GameState {
  creatureState: CreatureState;
  playerPosition: { x: number; y: number };
}

export interface EvolutionResult {
  previousCreature: CreatureDefinition;
  newCreature: CreatureDefinition;
  wasEvolution: boolean;
}
