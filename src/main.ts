// Jelly Surprise 2026 - Main Entry Point
// A cozy creature evolution game

import Phaser from 'phaser';

// Main game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// Initialize game
const game = new Phaser.Game(config);

console.log('🫧 Jelly Surprise 2026 - Game initialized');
console.log('TODO: Add game scenes (Boot, Menu, Game, UI)');
