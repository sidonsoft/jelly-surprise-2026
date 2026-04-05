import type { Element } from '../constants';

const SAVE_KEY = 'jellySurprise_save_v1';

export interface GameState {
  player: { x: number; y: number };
  evolutionPoints: number;
  collectedEssence: Partial<Record<Element, number>>;
  discoveredCreatures: { name: string; element: Element }[];
  currentCreature: { name: string; element: Element } | null;
  saveTimestamp: number;
}

export function saveGame(state: Omit<GameState, 'saveTimestamp'>): void {
  try {
    const saveData: GameState = {
      ...state,
      saveTimestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function loadGame(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved);
    return data;
  } catch (e) {
    console.error('Failed to load save:', e);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.error('Failed to clear save:', e);
  }
}