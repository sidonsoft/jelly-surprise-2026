import Phaser from 'phaser';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;
const ESSENCE_COUNT = 15;
const ESSENCE_COLLECT_THRESHOLD = 20;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d72',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
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

function preload() {
}

function create() {
  const scene = this;
  collectedCount = 0;
  essences = [];

  cam = scene.cameras.main;
  cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  cam.startFollow(player, true, 0.1, 0.1);

  scene.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  player = scene.add.arc(400, 300, 25, 0, 360, false, 0x00ff88);
  player.setFillStyle(0x00ff88, 1);
  scene.physics.add.existing(player, false);
  (player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

  const graphics = scene.add.graphics();
  graphics.fillStyle(0x000000, 0.3);
  graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  for (let i = 0; i < ESSENCE_COUNT; i++) {
    spawnEssence(scene);
  }

  const uiContainer = scene.add.container(0, 0);
  uiContainer.setScrollFactor(0);
  uiContainer.setDepth(100);

  essenceCounter = scene.add.text(10, 10, 'Essences: 0', {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  });
  uiContainer.add(essenceCounter);

  evolutionBar = scene.add.graphics();
  uiContainer.add(evolutionBar);

  const evoLabel = scene.add.text(10, 40, 'Evolution', {
    fontSize: '14px',
    color: '#aaaaaa',
    fontFamily: 'Arial, sans-serif',
  });
  uiContainer.add(evoLabel);

  drawEvolutionBar(0);

  cursors = scene.input.keyboard!.createCursorKeys();
  wasd = {
    W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };
}

function update() {
  const speed = 200;
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

function spawnEssence(scene: Phaser.Scene) {
  const x = Phaser.Math.Between(50, WORLD_WIDTH - 50);
  const y = Phaser.Math.Between(50, WORLD_HEIGHT - 50);
  const essence = scene.add.circle(x, y, 12, 0xffdd00, 0.8);
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
    if (dist < 35) {
      e.destroy();
      essences.splice(i, 1);
      collectedCount++;
      essenceCounter.setText(`Essences: ${collectedCount}`);

      drawEvolutionBar(collectedCount / ESSENCE_COLLECT_THRESHOLD);

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
