import Phaser from 'phaser';
import { ELEMENTS, ELEMENT_COLORS, ELEMENT_EMOJI, CREATURES } from './constants';
import type { Element } from './constants';
import { saveGame, loadGame as loadGameFromStorage, clearSave } from './systems/SaveSystem';
import { showSaveIndicator, showLoadToast } from './ui/SaveIndicator';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PLAYER_SIZE = 40;
const ORB_SIZE = 20;
const ORB_COUNT = 8;
const EVOLUTION_MAX = 10;
const PLAYER_SPEED = 200;

interface GameState {
  player: { x: number; y: number };
  orbs: { x: number; y: number; element: Element }[];
  evolutionPoints: number;
  collectedEssence: Partial<Record<Element, number>>;
  discoveredCreatures: { name: string; element: Element }[];
  currentCreature: { name: string; element: Element } | null;
  isEvolving: boolean;
}

let gameState: GameState = {
  player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
  orbs: [],
  evolutionPoints: 0,
  collectedEssence: {},
  discoveredCreatures: [],
  currentCreature: null,
  isEvolving: false
};

let playerGraphics: Phaser.GameObjects.Graphics;
let playerEmoji: Phaser.GameObjects.Text;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
let orbGraphics: Map<number, Phaser.GameObjects.Graphics> = new Map();
let orbEmojis: Map<number, Phaser.GameObjects.Text> = new Map();
let orbIdCounter = 0;
let autoSaveTimer: Phaser.Time.TimerEvent | null = null;
const AUTO_SAVE_INTERVAL = 30000;

export class JellyGame extends Phaser.Scene {
  constructor() {
    super({ key: 'JellyGame' });
  }

  create() {
    this.createGrid();
    this.createPlayer();
    this.spawnOrbs();
    this.setupControls();
    this.setupUI();
    this.loadGame();
    this.startAutoSave();
  }

  startAutoSave() {
    autoSaveTimer = this.time.addEvent({
      delay: AUTO_SAVE_INTERVAL,
      callback: () => this.saveGame(),
      loop: true
    });
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.05);
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(CANVAS_WIDTH, y);
    }
    graphics.strokePath();
  }

  createPlayer() {
    playerGraphics = this.add.graphics();
    const color = gameState.currentCreature ? ELEMENT_COLORS[gameState.currentCreature.element] : 0xe94560;
    this.drawGlowCircle(playerGraphics, gameState.player.x, gameState.player.y, PLAYER_SIZE, color);

    const emoji = gameState.currentCreature ? ELEMENT_EMOJI[gameState.currentCreature.element] : '🫧';
    playerEmoji = this.add.text(gameState.player.x, gameState.player.y + 8, emoji, { fontSize: '28px' }).setOrigin(0.5);
  }

  drawGlowCircle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number, isPlayer = false) {
    graphics.clear();
    const glowRadius = isPlayer ? radius * 1.5 : radius * 1.3;
    for (let i = 5; i > 0; i--) {
      const alpha = isPlayer ? 0.15 : 0.2;
      const shrink = isPlayer ? i * 3 : i * 2;
      graphics.fillStyle(color, alpha / (i * 0.5));
      graphics.fillCircle(x, y, glowRadius - shrink);
    }
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x, y, radius);
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.strokeCircle(x, y, radius);
  }

  setupControls() {
    cursors = this.input.keyboard!.createCursorKeys();
    wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  setupUI() {
    const modalOverlay = document.getElementById('modal-overlay')!;
    const modalButton = document.getElementById('modal-button')!;
    modalButton.addEventListener('click', () => {
      modalOverlay.classList.remove('show');
      gameState.isEvolving = false;
    });

    const resetBtn = document.getElementById('reset-btn')!;
    const confirmDialog = document.getElementById('confirm-dialog')!;
    const confirmYes = document.getElementById('confirm-yes')!;
    const confirmNo = document.getElementById('confirm-no')!;

    resetBtn.addEventListener('click', () => {
      confirmDialog.classList.add('show');
    });

    confirmYes.addEventListener('click', () => {
      confirmDialog.classList.remove('show');
      this.resetGame();
    });

    confirmNo.addEventListener('click', () => {
      confirmDialog.classList.remove('show');
    });
  }

  resetGame() {
    clearSave();
    gameState.player = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    gameState.evolutionPoints = 0;
    gameState.collectedEssence = {};
    gameState.discoveredCreatures = [];
    gameState.currentCreature = null;
    gameState.isEvolving = false;

    playerGraphics.clear();
    this.drawGlowCircle(playerGraphics, gameState.player.x, gameState.player.y, PLAYER_SIZE, 0xe94560, true);
    playerEmoji.setText('🫧');

    this.updateUI();
    showSaveIndicator();
  }

  spawnOrbs() {
    gameState.orbs = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      this.spawnOrb();
    }
  }

  spawnOrb() {
    const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    let x: number, y: number;
    do {
      x = Math.random() * (CANVAS_WIDTH - ORB_SIZE * 4) + ORB_SIZE * 2;
      y = Math.random() * (CANVAS_HEIGHT - ORB_SIZE * 4) + ORB_SIZE * 2;
    } while (this.distance(x, y, gameState.player.x, gameState.player.y) < 100);

    const orbId = orbIdCounter++;
    gameState.orbs.push({ x, y, element });
    this.drawOrb(orbId, { x, y, element });
  }

  drawOrb(orbId: number, orb: { x: number; y: number; element: Element }) {
    const orbGfx = this.add.graphics();
    orbGfx.setData('position', { x: orb.x, y: orb.y });
    this.drawGlowCircle(orbGfx, orb.x, orb.y, ORB_SIZE, ELEMENT_COLORS[orb.element]);
    orbGraphics.set(orbId, orbGfx);

    const emojiText = this.add.text(orb.x, orb.y + 5, ELEMENT_EMOJI[orb.element], { fontSize: '14px' }).setOrigin(0.5);
    orbEmojis.set(orbId, emojiText);
  }

  removeOrbGraphics(orbId: number) {
    const gfx = orbGraphics.get(orbId);
    if (gfx) {
      gfx.destroy();
      orbGraphics.delete(orbId);
    }
    const emoji = orbEmojis.get(orbId);
    if (emoji) {
      emoji.destroy();
      orbEmojis.delete(orbId);
    }
  }

  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  update() {
    if (gameState.isEvolving) return;

    this.handleMovement();
    this.checkCollisions();
  }

  handleMovement() {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd.A.isDown) vx = -1;
    else if (cursors.right.isDown || wasd.D.isDown) vx = 1;

    if (cursors.up.isDown || wasd.W.isDown) vy = -1;
    else if (cursors.down.isDown || wasd.S.isDown) vy = 1;

    if (vx !== 0 || vy !== 0) {
      const magnitude = Math.sqrt(vx * vx + vy * vy);
      vx /= magnitude;
      vy /= magnitude;
    }

    const delta = this.game.loop.delta / 1000;
    gameState.player.x = Phaser.Math.Clamp(
      gameState.player.x + vx * PLAYER_SPEED * delta,
      PLAYER_SIZE,
      CANVAS_WIDTH - PLAYER_SIZE
    );
    gameState.player.y = Phaser.Math.Clamp(
      gameState.player.y + vy * PLAYER_SPEED * delta,
      PLAYER_SIZE,
      CANVAS_HEIGHT - PLAYER_SIZE
    );

    const wobble = Math.sin(this.time.now / 200) * 3;
    playerGraphics.clear();
    const color = gameState.currentCreature ? ELEMENT_COLORS[gameState.currentCreature.element] : 0xe94560;
    this.drawGlowCircle(playerGraphics, gameState.player.x, gameState.player.y + wobble, PLAYER_SIZE, color, true);
    playerEmoji.setPosition(gameState.player.x, gameState.player.y + wobble + 8);
  }

  checkCollisions() {
    for (let i = gameState.orbs.length - 1; i >= 0; i--) {
      const orb = gameState.orbs[i];
      const orbId = this.findOrbId(orb);
      if (orbId !== null && this.distance(gameState.player.x, gameState.player.y, orb.x, orb.y) < (PLAYER_SIZE + ORB_SIZE)) {
        this.collectOrb(orb, i, orbId);
      }
    }
  }

  findOrbId(orb: { x: number; y: number; element: Element }): number | null {
    for (const [id, gfx] of orbGraphics.entries()) {
      const pos = gfx.getData('position');
      if (pos && pos.x === orb.x && pos.y === orb.y) {
        return id;
      }
    }
    return null;
  }

  collectOrb(orb: { x: number; y: number; element: Element }, index: number, orbId: number) {
    gameState.evolutionPoints++;
    gameState.collectedEssence[orb.element] = (gameState.collectedEssence[orb.element] || 0) + 1;

    this.removeOrbGraphics(orbId);

    gameState.orbs.splice(index, 1);
    this.spawnOrb();
    this.updateUI();

    if (gameState.evolutionPoints >= EVOLUTION_MAX) {
      this.triggerEvolution();
    }

    this.saveGame();
  }

  triggerEvolution() {
    gameState.isEvolving = true;

    const weights = ELEMENTS.map((el) => gameState.collectedEssence[el] || 0);
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    let randomRoll = Math.random() * totalWeight;
    let selectedCreature = CREATURES[0];
    for (let i = 0; i < CREATURES.length; i++) {
      randomRoll -= weights[i];
      if (randomRoll <= 0) {
        selectedCreature = CREATURES[i];
        break;
      }
    }

    gameState.currentCreature = selectedCreature;

    if (!gameState.discoveredCreatures.find((c) => c.name === selectedCreature.name)) {
      gameState.discoveredCreatures.push(selectedCreature);
      this.saveGame();
    }

    const color = ELEMENT_COLORS[selectedCreature.element];
    this.drawGlowCircle(playerGraphics, gameState.player.x, gameState.player.y, PLAYER_SIZE, color, true);
    playerEmoji.setText(ELEMENT_EMOJI[selectedCreature.element]);

    const modalOverlay = document.getElementById('modal-overlay')!;
    const modalEmoji = document.getElementById('modal-emoji')!;
    const modalTitle = document.getElementById('modal-title')!;
    const modalSubtitle = document.getElementById('modal-subtitle')!;
    const modalAbility = document.getElementById('modal-ability')!;

    modalEmoji.textContent = ELEMENT_EMOJI[selectedCreature.element];
    modalTitle.textContent = `You became a ${selectedCreature.element.toUpperCase()} JELLY!`;
    modalSubtitle.textContent = gameState.discoveredCreatures.length === CREATURES.length
      ? 'You discovered all creatures!'
      : 'A new creature has awakened';
    modalAbility.textContent = selectedCreature.ability;
    modalTitle.style.textShadow = `0 0 20px #${color.toString(16).padStart(6, '0')}`;

    modalOverlay.classList.add('show');

    gameState.evolutionPoints = 0;
    this.updateUI();
    this.saveGame();
  }

  updateUI() {
    const creatureEmoji = document.getElementById('creature-emoji')!;
    const creatureName = document.getElementById('creature-name')!;
    const essenceCounter = document.getElementById('essence-counter')!;
    const creatureCount = document.getElementById('creature-count')!;
    const evolutionBarFill = document.getElementById('evolution-bar-fill') as HTMLDivElement;
    const evolutionText = document.getElementById('evolution-text')!;

    const currentEmoji = gameState.currentCreature ? ELEMENT_EMOJI[gameState.currentCreature.element] : '🫧';
    const currentName = gameState.currentCreature ? gameState.currentCreature.name : 'Baby Jelly';

    creatureEmoji.textContent = currentEmoji;
    creatureName.textContent = currentName;
    essenceCounter.textContent = `Essence: ${gameState.evolutionPoints}`;
    creatureCount.textContent = `Found: ${gameState.discoveredCreatures.length}/${CREATURES.length}`;

    const fillPercent = (gameState.evolutionPoints / EVOLUTION_MAX) * 100;
    evolutionBarFill.style.width = `${fillPercent}%`;
    evolutionText.textContent = `${gameState.evolutionPoints} / ${EVOLUTION_MAX} Essence`;
  }

  saveGame() {
    showSaveIndicator();
    saveGame({
      player: gameState.player,
      evolutionPoints: gameState.evolutionPoints,
      collectedEssence: gameState.collectedEssence,
      discoveredCreatures: gameState.discoveredCreatures,
      currentCreature: gameState.currentCreature
    });
  }

  loadGame() {
    const saved = loadGameFromStorage();
    if (saved) {
      try {
        gameState.player = saved.player || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
        gameState.evolutionPoints = saved.evolutionPoints || 0;
        gameState.collectedEssence = saved.collectedEssence || {};
        gameState.discoveredCreatures = saved.discoveredCreatures || [];
        gameState.currentCreature = saved.currentCreature || null;

        if (gameState.currentCreature) {
          const color = ELEMENT_COLORS[gameState.currentCreature.element];
          this.drawGlowCircle(playerGraphics, gameState.player.x, gameState.player.y, PLAYER_SIZE, color, true);
          playerEmoji.setText(ELEMENT_EMOJI[gameState.currentCreature.element]);
        }

        this.updateUI();
        showLoadToast();
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
  }
}