import type { EvolutionResult } from '../types';
import { CREATURES } from '../data/creatures';

export class EvolutionScene extends Phaser.Scene {
  private result: EvolutionResult | null = null;
  private modalContainer: Phaser.GameObjects.Container | null = null;
  private resolvePromise: ((value: boolean) => void) | null = null;
  private isShown: boolean = false;

  constructor() {
    super({ key: 'EvolutionScene' });
  }

  showEvolution(result: EvolutionResult): Promise<boolean> {
    this.result = result;
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.createModal();
      this.isShown = true;
    });
  }

  private createModal() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.modalContainer = this.add.container(cx, cy);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(-400, -300, 800, 600);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(-400, -300, 800, 600), Phaser.Geom.Rectangle.Contains);
    this.modalContainer.add(backdrop);

    const panel = this.add.graphics();
    panel.fillStyle(0x2d2d72, 0.95);
    panel.fillRoundedRect(-180, -220, 360, 440, 20);
    panel.lineStyle(3, 0xffffff, 0.5);
    panel.strokeRoundedRect(-180, -220, 360, 440, 20);
    this.modalContainer.add(panel);

    const title = this.add.text(0, -180, 'Evolution Complete!', {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.modalContainer.add(title);

    const creature = this.result!.newCreature;
    const preview = this.add.circle(0, -60, Math.min(creature.radius * 2, 80), creature.color, 1);
    preview.setStrokeStyle(3, 0xffffff, 0.6);
    this.modalContainer.add(preview);

    this.tweens.add({
      targets: preview,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const nameText = this.add.text(0, 40, creature.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    nameText.setOrigin(0.5);
    this.modalContainer.add(nameText);

    const descText = this.add.text(0, 75, creature.description, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'italic',
      wordWrap: { width: 280 },
      align: 'center',
    });
    descText.setOrigin(0.5);
    this.modalContainer.add(descText);

    const tierBadge = this.add.graphics();
    tierBadge.fillStyle(creature.tier === 3 ? 0xff6600 : creature.tier === 2 ? 0x00ccff : 0x00ff88, 1);
    tierBadge.fillRoundedRect(-30, 105, 60, 24, 12);
    this.modalContainer.add(tierBadge);

    const tierText = this.add.text(0, 117, `Tier ${creature.tier}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    tierText.setOrigin(0.5);
    this.modalContainer.add(tierText);

    const continueBtn = this.add.graphics();
    continueBtn.fillStyle(0x00ff88, 1);
    continueBtn.fillRoundedRect(-90, 160, 180, 50, 12);
    this.modalContainer.add(continueBtn);

    const continueText = this.add.text(0, 185, 'Continue', {
      fontSize: '20px',
      color: '#1a1a2e',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    continueText.setOrigin(0.5);
    this.modalContainer.add(continueText);

    const btnHitArea = this.add.rectangle(0, 185, 180, 50, 0x000000, 0);
    btnHitArea.setInteractive({ useHandCursor: true });
    this.modalContainer.add(btnHitArea);

    const particles = this.createEvolutionParticles();
    this.modalContainer.add(particles);

    btnHitArea.on('pointerover', () => {
      continueBtn.clear();
      continueBtn.fillStyle(0x00cc66, 1);
      continueBtn.fillRoundedRect(-90, 160, 180, 50, 12);
    });

    btnHitArea.on('pointerout', () => {
      continueBtn.clear();
      continueBtn.fillStyle(0x00ff88, 1);
      continueBtn.fillRoundedRect(-90, 160, 180, 50, 12);
    });

    btnHitArea.on('pointerdown', () => {
      this.closeModal();
    });

    this.modalContainer.setDepth(1000);
    this.modalContainer.setAlpha(0);
    this.modalContainer.setScale(0.8);

    this.tweens.add({
      targets: this.modalContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  private createEvolutionParticles(): Phaser.GameObjects.Container {
    const container = this.add.container(0, -60);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 70;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const size = Phaser.Math.Between(4, 8);

      const particle = this.add.circle(x, y, size, 0xffff00, 0.8);
      container.add(particle);

      const startAngle = angle;
      const tween = this.tweens.add({
        targets: particle,
        x: x * 1.5,
        y: y * 1.5,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 1000,
        delay: i * 50,
        ease: 'Quad.easeOut',
        repeat: -1,
        onComplete: () => {
          particle.setPosition(x, y);
          particle.setAlpha(0.8);
          particle.setScale(1, 1);
        },
      });
    }

    return container;
  }

  private closeModal() {
    if (!this.modalContainer) return;

    this.tweens.add({
      targets: this.modalContainer,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.modalContainer?.destroy();
        this.modalContainer = null;
        this.isShown = false;
        this.result = null;
        if (this.resolvePromise) {
          this.resolvePromise(true);
          this.resolvePromise = null;
        }
      },
    });
  }

  isEvolutionModalShown(): boolean {
    return this.isShown;
  }

  hideModalImmediate() {
    if (this.modalContainer) {
      this.modalContainer.destroy();
      this.modalContainer = null;
    }
    this.isShown = false;
    this.result = null;
  }
}