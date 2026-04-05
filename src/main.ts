import Phaser from 'phaser';
import { JellyGame } from './game';

const TIPS = [
  'Collect essence orbs to evolve into different creatures!',
  'Each creature has a unique element: Fire, Water, Sky, Forest, or Mystic!',
  'Press WASD or arrow keys to move your jelly!',
  'Discover all 5 creatures to complete your collection!',
  'Use the mute button to toggle sound effects!'
];

const loadingBar = document.getElementById('loading-bar') as HTMLDivElement;
const loadingOverlay = document.getElementById('loading-overlay') as HTMLDivElement;
const loadingTip = document.getElementById('loading-tip') as HTMLDivElement;

let progress = 0;
const tipIndex = Math.floor(Math.random() * TIPS.length);
if (loadingTip) loadingTip.textContent = TIPS[tipIndex];

const progressInterval = setInterval(() => {
  if (progress < 90) {
    progress += Math.random() * 15;
    if (loadingBar) loadingBar.style.width = `${Math.min(progress, 90)}%`;
  }
}, 200);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [JellyGame],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

window.addEventListener('game-ready', () => {
  clearInterval(progressInterval);
  if (loadingBar) loadingBar.style.width = '100%';
  setTimeout(() => {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }, 300);
});