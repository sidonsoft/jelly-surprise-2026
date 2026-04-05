import { CREATURES } from '../data/creatures';
import { creatureManager } from '../systems/CreatureManager';
import type { CreatureDefinition } from '../types';

export class CatalogScene extends Phaser.Scene {
  private modalContainer: Phaser.GameObjects.Container | null = null;
  private resolvePromise: ((value: boolean) => void) | null = null;
  private isShown: boolean = false;
  private cardData: { creature: CreatureDefinition; card: Phaser.GameObjects.Container }[] = [];
  private detailContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'CatalogScene' });
  }

  showCatalog(): Promise<boolean> {
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
    backdrop.fillStyle(0x000000, 0.8);
    backdrop.fillRect(-400, -300, 800, 600);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(-400, -300, 800, 600), Phaser.Geom.Rectangle.Contains);
    this.modalContainer.add(backdrop);

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(-280, -240, 560, 480, 16);
    panel.lineStyle(2, 0xffffff, 0.3);
    panel.strokeRoundedRect(-280, -240, 560, 480, 16);
    this.modalContainer.add(panel);

    const title = this.add.text(0, -205, 'Creature Catalog', {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.modalContainer.add(title);

    const discoveredCount = creatureManager.getDiscoveryCount();
    const totalCount = CREATURES.length;
    const progressText = this.add.text(0, -165, `${discoveredCount}/${totalCount} Discovered`, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    });
    progressText.setOrigin(0.5);
    this.modalContainer.add(progressText);

    this.cardData = [];
    const gridCols = 3;
    const cardWidth = 140;
    const cardHeight = 160;
    const gapX = 20;
    const gapY = 20;
    const startX = -((gridCols - 1) * (cardWidth + gapX)) / 2;
    const startY = -100;

    CREATURES.forEach((creature, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      const card = this.createCreatureCard(creature, x, y, cardWidth, cardHeight);
      this.cardData.push({ creature, card });
      this.modalContainer!.add(card);
    });

    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0x444444, 1);
    closeBtn.fillRoundedRect(210, -225, 50, 30, 8);
    closeBtn.lineStyle(2, 0xffffff, 0.5);
    closeBtn.strokeRoundedRect(210, -225, 50, 30, 8);
    this.modalContainer.add(closeBtn);

    const closeText = this.add.text(235, -210, 'X', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    closeText.setOrigin(0.5);
    this.modalContainer.add(closeText);

    const closeHitArea = this.add.rectangle(235, -210, 50, 30, 0x000000, 0);
    closeHitArea.setInteractive({ useHandCursor: true });
    this.modalContainer.add(closeHitArea);

    closeHitArea.on('pointerover', () => {
      closeBtn.clear();
      closeBtn.fillStyle(0x666666, 1);
      closeBtn.fillRoundedRect(210, -225, 50, 30, 8);
      closeBtn.lineStyle(2, 0xffffff, 0.5);
      closeBtn.strokeRoundedRect(210, -225, 50, 30, 8);
    });

    closeHitArea.on('pointerout', () => {
      closeBtn.clear();
      closeBtn.fillStyle(0x444444, 1);
      closeBtn.fillRoundedRect(210, -225, 50, 30, 8);
      closeBtn.lineStyle(2, 0xffffff, 0.5);
      closeBtn.strokeRoundedRect(210, -225, 50, 30, 8);
    });

    closeHitArea.on('pointerdown', () => {
      this.closeModal();
    });

    backdrop.on('pointerdown', () => {
      this.closeModal();
    });

    this.modalContainer.setDepth(900);
    this.modalContainer.setAlpha(0);
    this.modalContainer.setScale(0.9);

    this.tweens.add({
      targets: this.modalContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Quad.easeOut',
    });
  }

  private createCreatureCard(creature: CreatureDefinition, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);
    const isDiscovered = creatureManager.isDiscovered(creature.id);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(isDiscovered ? 0x2d2d72 : 0x1a1a2e, 1);
    cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    cardBg.lineStyle(2, isDiscovered ? 0x00ff88 : 0x333333, 0.5);
    cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    card.add(cardBg);

    if (isDiscovered) {
      const preview = this.add.circle(0, -10, Math.min(creature.radius * 1.5, 40), creature.color, 1);
      preview.setStrokeStyle(2, 0xffffff, 0.4);
      card.add(preview);

      const nameText = this.add.text(0, 50, creature.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      });
      nameText.setOrigin(0.5);
      card.add(nameText);

      const tierBadge = this.add.graphics();
      tierBadge.fillStyle(creature.tier === 3 ? 0xff6600 : creature.tier === 2 ? 0x00ccff : 0x00ff88, 1);
      tierBadge.fillRoundedRect(-22, 70, 44, 18, 6);
      card.add(tierBadge);

      const tierText = this.add.text(0, 79, `Tier ${creature.tier}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      });
      tierText.setOrigin(0.5);
      card.add(tierText);
    } else {
      const silhouette = this.add.circle(0, -10, Math.min(creature.radius * 1.5, 40), 0x333333, 0.8);
      silhouette.setStrokeStyle(2, 0x444444, 0.4);
      card.add(silhouette);

      const questionText = this.add.text(0, 50, '???', {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      });
      questionText.setOrigin(0.5);
      card.add(questionText);

      const unknownText = this.add.text(0, 70, 'Unknown', {
        fontSize: '11px',
        color: '#444444',
        fontFamily: 'Arial, sans-serif',
      });
      unknownText.setOrigin(0.5);
      card.add(unknownText);
    }

    const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    card.add(hitArea);

    hitArea.on('pointerover', () => {
      cardBg.clear();
      cardBg.fillStyle(isDiscovered ? 0x3d3d82 : 0x2a2a3e, 1);
      cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      cardBg.lineStyle(2, isDiscovered ? 0x00ff88 : 0x333333, 0.7);
      cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    });

    hitArea.on('pointerout', () => {
      cardBg.clear();
      cardBg.fillStyle(isDiscovered ? 0x2d2d72 : 0x1a1a2e, 1);
      cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      cardBg.lineStyle(2, isDiscovered ? 0x00ff88 : 0x333333, 0.5);
      cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    });

    hitArea.on('pointerdown', () => {
      if (isDiscovered) {
        this.showCreatureDetail(creature);
      }
    });

    return card;
  }

  private showCreatureDetail(creature: CreatureDefinition) {
    if (this.detailContainer) {
      this.detailContainer.destroy();
    }

    this.detailContainer = this.add.container(0, 0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(-400, -300, 800, 600);
    this.detailContainer.add(overlay);

    const detailPanel = this.add.graphics();
    detailPanel.fillStyle(0x2d2d72, 0.95);
    detailPanel.fillRoundedRect(-150, -150, 300, 300, 16);
    detailPanel.lineStyle(3, 0xffffff, 0.4);
    detailPanel.strokeRoundedRect(-150, -150, 300, 300, 16);
    this.detailContainer.add(detailPanel);

    const preview = this.add.circle(0, -40, 50, creature.color, 1);
    preview.setStrokeStyle(3, 0xffffff, 0.5);
    this.detailContainer.add(preview);

    this.tweens.add({
      targets: preview,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 600,
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
    this.detailContainer.add(nameText);

    const descText = this.add.text(0, 75, creature.description, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'italic',
      wordWrap: { width: 240 },
      align: 'center',
    });
    descText.setOrigin(0.5);
    this.detailContainer.add(descText);

    const tierBadge = this.add.graphics();
    tierBadge.fillStyle(creature.tier === 3 ? 0xff6600 : creature.tier === 2 ? 0x00ccff : 0x00ff88, 1);
    tierBadge.fillRoundedRect(-35, 110, 70, 24, 10);
    this.detailContainer.add(tierBadge);

    const tierText = this.add.text(0, 122, `Tier ${creature.tier}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    tierText.setOrigin(0.5);
    this.detailContainer.add(tierText);

    const closeDetailBtn = this.add.graphics();
    closeDetailBtn.fillStyle(0x00ff88, 1);
    closeDetailBtn.fillRoundedRect(-60, 145, 120, 40, 10);
    this.detailContainer.add(closeDetailBtn);

    const closeDetailText = this.add.text(0, 165, 'Close', {
      fontSize: '18px',
      color: '#1a1a2e',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    closeDetailText.setOrigin(0.5);
    this.detailContainer.add(closeDetailText);

    const closeDetailHitArea = this.add.rectangle(0, 165, 120, 40, 0x000000, 0);
    closeDetailHitArea.setInteractive({ useHandCursor: true });
    this.detailContainer.add(closeDetailHitArea);

    closeDetailHitArea.on('pointerdown', () => {
      if (this.detailContainer) {
        this.detailContainer.destroy();
        this.detailContainer = null;
      }
    });

    this.detailContainer.setDepth(1000);
    this.modalContainer!.add(this.detailContainer);
  }

  private closeModal() {
    if (!this.modalContainer) return;

    this.tweens.add({
      targets: this.modalContainer,
      alpha: 0,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.modalContainer?.destroy();
        this.modalContainer = null;
        this.isShown = false;
        this.cardData = [];
        if (this.resolvePromise) {
          this.resolvePromise(true);
          this.resolvePromise = null;
        }
      },
    });
  }

  isCatalogShown(): boolean {
    return this.isShown;
  }
}