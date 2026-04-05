import Phaser from 'phaser';
import { EVOLUTION_THRESHOLD, ESSENCE_COUNT, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SPEED, ESSENCE_COLLECT_RADIUS, ESSENCE_SPAWN_MARGIN, ESSENCE_RADIUS } from './config';
import { creatureManager } from './systems/CreatureManager';
import type { EvolutionResult } from './types';
import { EvolutionScene } from './scenes/EvolutionScene';
import { CatalogScene } from './scenes/CatalogScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d72',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

let player: Phaser.GameObjects.Arc;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
let essences: Phaser.GameObjects.Arc[];
let essenceCounter: Phaser.GameObjects.Text;
let evolutionBar: Phaser.GameObjects.Graphics;
let collectedCount: number;
let cam: Phaser.Cameras.Scene2D.Camera;
let evolutionText: Phaser.GameObjects.Text;
let lastEvolutionResult: EvolutionResult | null = null;
let isPaused: boolean = false;
let evolutionScene: EvolutionScene;
let catalogScene: CatalogScene;

function preload() {
}

function create(this: Phaser.Scene) {
  collectedCount = 0;
  essences = [];
  isPaused = false;

  evolutionScene = new EvolutionScene();
  this.scene.add('EvolutionScene', evolutionScene, true);

  catalogScene = new CatalogScene();
  this.scene.add('CatalogScene', catalogScene, true);

  const initialCreature = creatureManager.getCurrentCreature();
  player = this.add.arc(400, 300, initialCreature.radius, 0, 360, false, initialCreature.color);
  player.setFillStyle(initialCreature.color, 1);
  this.physics.add.existing(player, false);
  (player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

  cam = this.cameras.main;
  cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  cam.startFollow(player, true, 0.1, 0.1);

  this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const graphics = this.add.graphics();
  graphics.fillStyle(0x000000, 0.3);
  graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  for (let i = 0; i < ESSENCE_COUNT; i++) {
    spawnEssence(this);
  }

  const uiContainer = this.add.container(0, 0);
  uiContainer.setScrollFactor(0);
  uiContainer.setDepth(100);

  essenceCounter = this.add.text(10, 10, 'Essences: 0', {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  });
  uiContainer.add(essenceCounter);

  evolutionBar = this.add.graphics();
  uiContainer.add(evolutionBar);

  const evoLabel = this.add.text(10, 40, 'Evolution', {
    fontSize: '14px',
    color: '#aaaaaa',
    fontFamily: 'Arial, sans-serif',
  });
  uiContainer.add(evoLabel);

  evolutionText = this.add.text(10, 85, '', {
    fontSize: '16px',
    color: '#ffff00',
    fontFamily: 'Arial, sans-serif',
  });
  uiContainer.add(evolutionText);

  const catalogBtn = this.add.graphics();
  catalogBtn.fillStyle(0x00ccff, 1);
  catalogBtn.fillRoundedRect(720, 10, 70, 35, 8);
  catalogBtn.lineStyle(2, 0xffffff, 0.4);
  catalogBtn.strokeRoundedRect(720, 10, 70, 35, 8);
  uiContainer.add(catalogBtn);

  const catalogText = this.add.text(755, 28, 'Catalog', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
  });
  catalogText.setOrigin(0.5);
  uiContainer.add(catalogText);

  const catalogHitArea = this.add.rectangle(755, 28, 70, 35, 0x000000, 0);
  catalogHitArea.setInteractive({ useHandCursor: true });
  uiContainer.add(catalogHitArea);

  catalogHitArea.on('pointerover', () => {
    catalogBtn.clear();
    catalogBtn.fillStyle(0x00aadd, 1);
    catalogBtn.fillRoundedRect(720, 10, 70, 35, 8);
    catalogBtn.lineStyle(2, 0xffffff, 0.4);
    catalogBtn.strokeRoundedRect(720, 10, 70, 35, 8);
  });

  catalogHitArea.on('pointerout', () => {
    catalogBtn.clear();
    catalogBtn.fillStyle(0x00ccff, 1);
    catalogBtn.fillRoundedRect(720, 10, 70, 35, 8);
    catalogBtn.lineStyle(2, 0xffffff, 0.4);
    catalogBtn.strokeRoundedRect(720, 10, 70, 35, 8);
  });

  catalogHitArea.on('pointerdown', async () => {
    if (!catalogScene.isCatalogShown()) {
      pauseGame();
      await catalogScene.showCatalog();
      resumeGame();
    }
  });

  creatureManager.on('evolution', async (result: EvolutionResult) => {
    lastEvolutionResult = result;
    updatePlayerVisual();
    evolutionText.setText(`Evolved into ${result.newCreature.name}!`);

    pauseGame();
    await evolutionScene.showEvolution(result);
    resumeGame();

    setTimeout(() => {
      if (evolutionText) {
        evolutionText.setText('');
      }
    }, 3000);
  });

  drawEvolutionBar(0);

  cursors = this.input.keyboard!.createCursorKeys();
  wasd = {
    W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };

  this.input.keyboard!.on('keydown-C', async () => {
    if (!isPaused && !catalogScene.isCatalogShown()) {
      pauseGame();
      await catalogScene.showCatalog();
      resumeGame();
    }
  });
}

function update(this: Phaser.Scene) {
  if (isPaused) return;

  const speed = PLAYER_SPEED;
  const body = player.body as Phaser.Physics.Arcade.Body;
  body.setVelocity(0);

  if (cursors.left.isDown || wasd.A.isDown) {
    body.setVelocityX(-speed);
  } else if (cursors.right.isDown || wasd.D.isDown) {
    body.setVelocityX(speed);
  }

  if (cursors.up.isDown || wasd.W.isDown) {
    body.setVelocityY(-speed);
  } else if (cursors.down.isDown || wasd.S.isDown) {
    body.setVelocityY(speed);
  }

  checkEssenceCollisions(this);
}

function pauseGame() {
  isPaused = true;
  if (player && player.body) {
    (player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
  }
}

function resumeGame() {
  isPaused = false;
}

function updatePlayerVisual() {
  const creature = creatureManager.getCurrentCreature();
  player.setRadius(creature.radius);
  player.setFillStyle(creature.color, 1);
}

function spawnEssence(scene: Phaser.Scene) {
  const x = Phaser.Math.Between(ESSENCE_SPAWN_MARGIN, WORLD_WIDTH - ESSENCE_SPAWN_MARGIN);
  const y = Phaser.Math.Between(ESSENCE_SPAWN_MARGIN, WORLD_HEIGHT - ESSENCE_SPAWN_MARGIN);
  const essence = scene.add.circle(x, y, ESSENCE_RADIUS, 0xffdd00, 0.8);
  essence.setStrokeStyle(2, 0xffaa00);
  essences.push(essence);

  scene.tweens.add({
    targets: essence,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function spawnFloatingText(scene: Phaser.Scene, x: number, y: number, text: string) {
  const floatingText = scene.add.text(x, y, text, {
    fontSize: '18px',
    color: '#ffff00',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 3,
  });
  floatingText.setOrigin(0.5);
  floatingText.setDepth(500);

  scene.tweens.add({
    targets: floatingText,
    y: y - 50,
    alpha: 0,
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 800,
    ease: 'Quad.easeOut',
    onComplete: () => {
      floatingText.destroy();
    },
  });
}

function checkEssenceCollisions(scene: Phaser.Scene) {
  const px = player.x;
  const py = player.y;

  for (let i = essences.length - 1; i >= 0; i--) {
    const e = essences[i];
    const dist = Phaser.Math.Distance.Between(px, py, e.x, e.y);
    if (dist < ESSENCE_COLLECT_RADIUS) {
      const ex = e.x;
      const ey = e.y;
      e.destroy();
      essences.splice(i, 1);
      collectedCount++;
      essenceCounter.setText(`Essences: ${collectedCount}`);

      spawnFloatingText(scene, ex, ey, '+1');

      const result = creatureManager.addEssence(1);
      const progress = creatureManager.getState().totalEssence / EVOLUTION_THRESHOLD;
      drawEvolutionBar(progress);

      if (essences.length < ESSENCE_COUNT) {
        spawnEssence(scene);
      }
    }
  }
}

function drawEvolutionBar(progress: number) {
  evolutionBar.clear();
  evolutionBar.fillStyle(0x333333, 1);
  evolutionBar.fillRect(10, 60, 200, 20);
  evolutionBar.fillStyle(0x00ff88, 1);
  evolutionBar.fillRect(10, 60, 200 * Math.min(progress, 1), 20);
}

new Phaser.Game(config);