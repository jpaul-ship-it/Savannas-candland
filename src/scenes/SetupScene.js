import Phaser from 'phaser';
import { PLAYER_COLORS_STR, PLAYER_EMOJIS } from '../utils/constants.js';

const MAX_PLAYERS = 4;

export class SetupScene extends Phaser.Scene {
  constructor() {
    super('Setup');
    this.playerConfigs = [
      { name: 'Player 1', isBot: false, active: true },
      { name: 'Player 2', isBot: false, active: true },
      { name: 'Player 3', isBot: true,  active: true },
      { name: 'Player 4', isBot: true,  active: false },
    ];
  }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Background
    this.add.image(W/2, H/2, 'title-bg');

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1A0533, 0.95);
    panel.fillRoundedRect(W/2 - 280, H/2 - 300, 560, 600, 24);
    panel.lineStyle(2, 0x9B6FE8, 0.8);
    panel.strokeRoundedRect(W/2 - 280, H/2 - 300, 560, 600, 24);
    // Top accent
    panel.fillStyle(0x9B6FE8, 1);
    panel.fillRoundedRect(W/2 - 280, H/2 - 300, 560, 64, 24);
    panel.fillRect(W/2 - 280, H/2 - 265, 560, 29);

    this.add.text(W/2, H/2 - 272, '🌟 Who\'s Playing?', {
      fontFamily: 'Fredoka One', fontSize: '32px', color: '#FFFFFF',
    }).setOrigin(0.5);

    this.rowObjects = [];
    this.renderRows();

    // Back button
    const backBg = this.add.image(W/2 - 110, H/2 + 254, 'btn-gray').setScale(0.9);
    this.add.text(W/2 - 110, H/2 + 254, '← Back', {
      fontFamily: 'Fredoka One', fontSize: '22px', color: '#C5A8FF',
    }).setOrigin(0.5);
    backBg.setInteractive({ useHandCursor: true });
    backBg.on('pointerdown', () => this.scene.start('Title'));
    backBg.on('pointerover', () => backBg.setScale(0.95));
    backBg.on('pointerout', () => backBg.setScale(0.9));

    // Play button
    const playBg = this.add.image(W/2 + 110, H/2 + 254, 'btn-purple').setScale(0.9);
    this.add.text(W/2 + 110, H/2 + 254, 'Play! 🎲', {
      fontFamily: 'Fredoka One', fontSize: '22px', color: '#FFFFFF',
    }).setOrigin(0.5);
    playBg.setInteractive({ useHandCursor: true });
    playBg.on('pointerover', () => playBg.setScale(0.95));
    playBg.on('pointerout', () => playBg.setScale(0.9));
    playBg.on('pointerdown', () => this.startGame());

    // Instruction
    this.add.text(W/2, H/2 + 208, 'Tap names to rename • Toggle Human/Bot', {
      fontFamily: 'Nunito', fontSize: '14px', color: '#9B6FE8', fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  renderRows() {
    // Clear old
    this.rowObjects.forEach(o => o.destroy());
    this.rowObjects = [];
    const W = this.scale.width, H = this.scale.height;

    this.playerConfigs.forEach((cfg, i) => {
      const rowY = H/2 - 200 + i * 88;
      const rowX = W/2 - 240;

      // Row bg
      const rg = this.add.graphics();
      rg.fillStyle(cfg.active ? 0x2D0A4E : 0x150325, 1);
      rg.fillRoundedRect(rowX, rowY, 480, 72, 16);
      if (cfg.active) {
        rg.lineStyle(2, Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[i]).color, 0.6);
        rg.strokeRoundedRect(rowX, rowY, 480, 72, 16);
      }
      this.rowObjects.push(rg);

      // Avatar circle
      const avatar = this.add.graphics();
      avatar.fillStyle(Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[i]).color, cfg.active ? 1 : 0.3);
      avatar.fillCircle(rowX + 36, rowY + 36, 24);
      this.rowObjects.push(avatar);

      const emojiText = this.add.text(rowX + 36, rowY + 36, PLAYER_EMOJIS[i], {
        fontFamily: 'Nunito', fontSize: '20px',
      }).setOrigin(0.5).setAlpha(cfg.active ? 1 : 0.3);
      this.rowObjects.push(emojiText);

      // Player name
      const nameText = this.add.text(rowX + 78, rowY + 36, cfg.name, {
        fontFamily: 'Nunito', fontSize: '20px', fontStyle: 'bold',
        color: cfg.active ? '#FFFFFF' : '#554488',
      }).setOrigin(0, 0.5);
      this.rowObjects.push(nameText);

      if (cfg.active) {
        // Make name editable via DOM input overlay
        const nameHitArea = this.add.zone(rowX + 170, rowY + 36, 180, 50).setInteractive({ useHandCursor: true });
        nameHitArea.on('pointerdown', () => {
          const name = prompt(`Enter name for Player ${i+1}:`, cfg.name);
          if (name && name.trim()) {
            this.playerConfigs[i].name = name.trim().substring(0, 16);
            this.renderRows();
          }
        });
        this.rowObjects.push(nameHitArea);

        // Bot/Human toggle
        const toggleBg = this.add.graphics();
        const isBot = cfg.isBot;
        toggleBg.fillStyle(isBot ? 0x9B6FE8 : 0x2EC4B6, 1);
        toggleBg.fillRoundedRect(rowX + 300, rowY + 20, 100, 34, 17);
        this.rowObjects.push(toggleBg);

        const toggleText = this.add.text(rowX + 350, rowY + 37, isBot ? '🤖 Bot' : '👤 Human', {
          fontFamily: 'Nunito', fontSize: '14px', fontStyle: 'bold', color: '#FFFFFF',
        }).setOrigin(0.5);
        this.rowObjects.push(toggleText);

        const toggleZone = this.add.zone(rowX + 350, rowY + 37, 100, 34).setInteractive({ useHandCursor: true });
        toggleZone.on('pointerdown', () => {
          this.playerConfigs[i].isBot = !this.playerConfigs[i].isBot;
          this.renderRows();
        });
        this.rowObjects.push(toggleZone);

        // Active toggle (if >2 players)
        if (i >= 2) {
          const activeToggle = this.add.graphics();
          activeToggle.fillStyle(cfg.active ? 0x06D6A0 : 0x333355, 1);
          activeToggle.fillRoundedRect(rowX + 418, rowY + 20, 50, 34, 17);
          this.rowObjects.push(activeToggle);

          const activeText = this.add.text(rowX + 443, rowY + 37, cfg.active ? 'IN' : 'OUT', {
            fontFamily: 'Nunito', fontSize: '12px', fontStyle: 'bold', color: '#FFFFFF',
          }).setOrigin(0.5);
          this.rowObjects.push(activeText);

          const activeZone = this.add.zone(rowX + 443, rowY + 37, 50, 34).setInteractive({ useHandCursor: true });
          activeZone.on('pointerdown', () => {
            const activeCount = this.playerConfigs.filter(p => p.active).length;
            if (cfg.active && activeCount <= 2) return; // min 2
            this.playerConfigs[i].active = !this.playerConfigs[i].active;
            this.renderRows();
          });
          this.rowObjects.push(activeZone);
        }
      }
    });
  }

  startGame() {
    const activePlayers = this.playerConfigs
      .filter(p => p.active)
      .map((p, i) => ({
        name: p.name,
        isBot: p.isBot,
        colorIndex: this.playerConfigs.findIndex(cfg => cfg === p),
      }));

    if (activePlayers.length < 1) return;

    this.scene.start('Game', { players: activePlayers });
    this.scene.start('UI', { players: activePlayers });
    this.scene.bringToTop('UI');
  }
}
