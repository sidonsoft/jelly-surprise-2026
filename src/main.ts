import Phaser from 'phaser';
import { JellyGame } from './game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: 800,
  height: 500,
  canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
  backgroundColor: '#1a1a2e',
  scene: [JellyGame],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);