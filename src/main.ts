import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d72',
  scene: {
    preload,
    create,
  },
};

function preload() {
}

function create() {
  this.add.text(400, 300, 'Jelly Surprise!', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  }).setOrigin(0.5);
  
  this.add.text(400, 360, 'Phase 1: Foundation', {
    fontSize: '24px',
    color: '#aaaaaa',
    fontFamily: 'Arial, sans-serif',
  }).setOrigin(0.5);
}

new Phaser.Game(config);
