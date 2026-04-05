import Phaser from 'phaser';
import { EVOLUTION_THRESHOLD, ESSENCE_COUNT, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SPEED, ESSENCE_COLLECT_RADIUS, ESSENCE_SPAWN_MARGIN, ESSENCE_RADIUS } from './config';
import { creatureManager } from './systems/CreatureManager';
import type { EvolutionResult } from './types';

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

function preload() {
}

function create(this: Phaser.Scene) {
  collectedCount = 0;
  essences = [];

  cam = this.cameras.main;
  cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  cam.startFollow(player, true, 0.1, 0.1);

  this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const initialCreature = creatureManager.getCurrentCreature();
  player = this.add.arc(400, 300, initialCreature.radius, 0, 360, false, initialCreature.color);
  player.setFillStyle(initialCreature.color, 1);
  this.physics.add.existing(player, false);
  (player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

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

  creatureManager.on('evolution', (result: EvolutionResult) => {
    lastEvolutionResult = result;
    updatePlayerVisual();
    evolutionText.setText(`Evolved into ${result.newCreature.name}!`);
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
}

function update(this: Phaser.Scene) {
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

function checkEssenceCollisions(scene: Phaser.Scene) {
  const px = player.x;
  const py = player.y;

  for (let i = essences.length - 1; i >= 0; i--) {
    const e = essences[i];
    const dist = Phaser.Math.Distance.Between(px, py, e.x, e.y);
    if (dist < ESSENCE_COLLECT_RADIUS) {
      e.destroy();
      essences.splice(i, 1);
      collectedCount++;
      essenceCounter.setText(`Essences: ${collectedCount}`);

      const result = creatureManager.addEssence(1);
      const progress = creatureManager.getState().totalEssence / EVOLUTION_THRESHOLD;
      drawEvolutionBar(progress);

      if (result.wasEvolution) {
        updatePlayerVisual();
      }

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
