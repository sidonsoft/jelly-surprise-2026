import { EventEmitter } from 'events';
import type { CreatureDefinition, CreatureState, EvolutionResult } from '../types';
import { CREATURES, TIER1_CREATURES, TIER2_CREATURES, TIER3_CREATURES, DEFAULT_CREATURE } from '../data/creatures';
import { EVOLUTION_THRESHOLD, EVOLUTION_WEIGHTS } from '../config';

export class CreatureManager extends EventEmitter {
  private state: CreatureState;

  constructor() {
    super();
    this.state = {
      currentCreature: DEFAULT_CREATURE,
      totalEssence: 0,
      evolutionCount: 0,
    };
  }

  getState(): CreatureState {
    return { ...this.state };
  }

  getCurrentCreature(): CreatureDefinition {
    return this.state.currentCreature;
  }

  addEssence(amount: number): EvolutionResult {
    this.state.totalEssence += amount;

    if (this.state.totalEssence >= EVOLUTION_THRESHOLD) {
      return this.evolve();
    }

    return {
      previousCreature: this.state.currentCreature,
      newCreature: this.state.currentCreature,
      wasEvolution: false,
    };
  }

  private evolve(): EvolutionResult {
    const previousCreature = this.state.currentCreature;
    const newCreature = this.selectEvolutionCreature();

    this.state.currentCreature = newCreature;
    this.state.totalEssence = 0;
    this.state.evolutionCount++;

    const result: EvolutionResult = {
      previousCreature,
      newCreature,
      wasEvolution: true,
    };

    this.emit('evolution', result);
    return result;
  }

  private selectEvolutionCreature(): CreatureDefinition {
    const roll = Math.random();
    let pool: CreatureDefinition[];

    if (roll < EVOLUTION_WEIGHTS.tier1) {
      pool = TIER1_CREATURES;
    } else if (roll < EVOLUTION_WEIGHTS.tier1 + EVOLUTION_WEIGHTS.tier2) {
      pool = TIER2_CREATURES;
    } else {
      pool = TIER3_CREATURES;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  reset(): void {
    this.state = {
      currentCreature: DEFAULT_CREATURE,
      totalEssence: 0,
      evolutionCount: 0,
    };
  }
}

export const creatureManager = new CreatureManager();
