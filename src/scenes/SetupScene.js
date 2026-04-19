import Phaser from 'phaser';
import { PLAYER_COLORS_STR, PLAYER_EMOJIS } from '../utils/constants.js';

export class SetupScene extends Phaser.Scene {
  constructor() {
    super('Setup');
    this.playerConfigs = [
      { name: 'Player 1', isBot: false, active: true },
      { name: 'Player 2', isBot: false, active: true },
      { name: 'Player 3', isBot: true,  active: false },
      { name: 'Player 4', isBot: true,  active: false },
    ];
  }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Background
    this.add.image(W/2, H/2, 'title-bg');

    // Panel
    const panelW = 580, panelH = 640;
    const panelX = W/2 - panelW/2, panelY = H/2 - panelH/2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1A0533, 0.97);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 24);
    panel.lineStyle(2, 0x9B6FE8, 0.8);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 24);
    // Header bar
    panel.fillStyle(0x9B6FE8, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, 66, 24);
    panel.fillRect(panelX, panelY + 40, panelW, 26);

    this.add.text(W/2, panelY + 33, '🌟 Who\'s Playing?', {
      fontFamily: 'Fredoka One', fontSize: '32px', color: '#FFFFFF',
    }).setOrigin(0.5);

    // Instruction text
    this.add.text(W/2, panelY + 82, 'Tap a name to rename it  •  Toggle Human / Bot  •  Press + / − to add or remove players', {
      fontFamily: 'Nunito', fontSize: '12px', color: '#9B6FE8', fontStyle: 'italic',
    }).setOrigin(0.5);

    this.rowObjects = [];
    this.panelX = panelX;
    this.panelY = panelY;
    this.panelW = panelW;
    this.renderRows();

    // Back button
    const backBg = this.add.image(W/2 - 115, panelY + panelH - 38, 'btn-gray').setScale(0.88);
    this.add.text(W/2 - 115, panelY + panelH - 38, '← Back', {
      fontFamily: 'Fredoka One', fontSize: '22px', color: '#C5A8FF',
    }).setOrigin(0.5);
    backBg.setInteractive({ useHandCursor: true });
    backBg.on('pointerdown', () => this.scene.start('Title'));
    backBg.on('pointerover', () => backBg.setScale(0.93));
    backBg.on('pointerout',  () => backBg.setScale(0.88));

    // Play button
    const playBg = this.add.image(W/2 + 115, panelY + panelH - 38, 'btn-purple').setScale(0.88);
    this.add.text(W/2 + 115, panelY + panelH - 38, 'Play! 🎲', {
      fontFamily: 'Fredoka One', fontSize: '22px', color: '#FFFFFF',
    }).setOrigin(0.5);
    playBg.setInteractive({ useHandCursor: true });
    playBg.on('pointerover', () => playBg.setScale(0.93));
    playBg.on('pointerout',  () => playBg.setScale(0.88));
    playBg.on('pointerdown', () => this.startGame());
  }

  renderRows() {
    // Clear old row objects
    this.rowObjects.forEach(o => o.destroy());
    this.rowObjects = [];

    const W = this.scale.width;
    const startY = this.panelY + 105;
    const rowH = 108;

    this.playerConfigs.forEach((cfg, i) => {
      const rowY = startY + i * rowH;
      const rowX = this.panelX + 20;
      const rowW = this.panelW - 40;

      // ── Row background ───────────────────────────────
      const rg = this.add.graphics();
      const pColor = Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[i]).color;

      if (cfg.active) {
        rg.fillStyle(0x2D0A4E, 1);
        rg.fillRoundedRect(rowX, rowY, rowW, 90, 16);
        rg.lineStyle(2, pColor, 0.7);
        rg.strokeRoundedRect(rowX, rowY, rowW, 90, 16);
      } else {
        rg.fillStyle(0x150325, 1);
        rg.fillRoundedRect(rowX, rowY, rowW, 90, 16);
        rg.lineStyle(1.5, 0x3D1B66, 0.5);
        rg.strokeRoundedRect(rowX, rowY, rowW, rowH - 16, 16);
      }
      this.rowObjects.push(rg);

      // ── Avatar circle ────────────────────────────────
      const avatar = this.add.graphics();
      avatar.fillStyle(pColor, cfg.active ? 1 : 0.3);
      avatar.fillCircle(rowX + 38, rowY + 45, 26);
      avatar.lineStyle(2.5, 0xFFFFFF, cfg.active ? 0.5 : 0.15);
      avatar.strokeCircle(rowX + 38, rowY + 45, 26);
      this.rowObjects.push(avatar);

      const emojiText = this.add.text(rowX + 38, rowY + 45, PLAYER_EMOJIS[i], {
        fontFamily: 'Nunito', fontSize: '20px',
      }).setOrigin(0.5).setAlpha(cfg.active ? 1 : 0.3);
      this.rowObjects.push(emojiText);

      // ── Player name ──────────────────────────────────
      const nameText = this.add.text(rowX + 76, rowY + 32, cfg.name, {
        fontFamily: 'Nunito', fontSize: '20px', fontStyle: 'bold',
        color: cfg.active ? '#FFFFFF' : '#554488',
      }).setOrigin(0, 0.5);
      this.rowObjects.push(nameText);

      // Status label
      const statusLabel = this.add.text(rowX + 76, rowY + 56, cfg.active ? '' : 'Not playing', {
        fontFamily: 'Nunito', fontSize: '12px',
        color: '#554488', fontStyle: 'italic',
      }).setOrigin(0, 0.5);
      this.rowObjects.push(statusLabel);

      // ── +/- TOGGLE (add/remove player) ──────────────
      const addRemoveBg = this.add.graphics();
      addRemoveBg.fillStyle(cfg.active ? 0x6B1FBB : 0x2EC4B6, 1);
      addRemoveBg.fillCircle(rowX + rowW - 22, rowY + 45, 18);
      addRemoveBg.lineStyle(2, 0xFFFFFF, 0.6);
      addRemoveBg.strokeCircle(rowX + rowW - 22, rowY + 45, 18);
      this.rowObjects.push(addRemoveBg);

      const addRemoveText = this.add.text(rowX + rowW - 22, rowY + 45, cfg.active ? '−' : '+', {
        fontFamily: 'Fredoka One', fontSize: '26px',
        color: '#FFFFFF',
      }).setOrigin(0.5, 0.5);
      this.rowObjects.push(addRemoveText);

      // Clickable zone for +/-
      const addRemoveZone = this.add.zone(rowX + rowW - 22, rowY + 45, 44, 44)
        .setInteractive({ useHandCursor: true });
      addRemoveZone.on('pointerdown', () => {
        const activeCount = this.playerConfigs.filter(p => p.active).length;
        if (cfg.active && activeCount <= 1) return; // need at least 1
        this.playerConfigs[i].active = !this.playerConfigs[i].active;
        this.renderRows();
      });
      addRemoveZone.on('pointerover', () => {
        addRemoveBg.setAlpha(0.75);
        addRemoveText.setAlpha(0.75);
      });
      addRemoveZone.on('pointerout', () => {
        addRemoveBg.setAlpha(1);
        addRemoveText.setAlpha(1);
      });
      this.rowObjects.push(addRemoveZone);

      if (cfg.active) {
        // ── Human/Bot toggle ──────────────────────────
        const toggleBg = this.add.graphics();
        toggleBg.fillStyle(cfg.isBot ? 0x9B6FE8 : 0x2EC4B6, 1);
        toggleBg.fillRoundedRect(rowX + rowW - 148, rowY + 30, 112, 32, 16);
        toggleBg.lineStyle(1.5, 0xFFFFFF, 0.4);
        toggleBg.strokeRoundedRect(rowX + rowW - 148, rowY + 30, 112, 32, 16);
        this.rowObjects.push(toggleBg);

        const toggleText = this.add.text(rowX + rowW - 92, rowY + 46,
          cfg.isBot ? '🤖  Bot' : '👤  Human', {
            fontFamily: 'Nunito', fontSize: '14px', fontStyle: 'bold', color: '#FFFFFF',
          }).setOrigin(0.5);
        this.rowObjects.push(toggleText);

        const toggleZone = this.add.zone(rowX + rowW - 92, rowY + 46, 112, 36)
          .setInteractive({ useHandCursor: true });
        toggleZone.on('pointerdown', () => {
          this.playerConfigs[i].isBot = !this.playerConfigs[i].isBot;
          this.renderRows();
        });
        toggleZone.on('pointerover', () => toggleBg.setAlpha(0.75));
        toggleZone.on('pointerout',  () => toggleBg.setAlpha(1));
        this.rowObjects.push(toggleZone);

        // ── Name tap zone ─────────────────────────────
        const nameZone = this.add.zone(rowX + 76 + 80, rowY + 32, 160, 36)
          .setInteractive({ useHandCursor: true });
        nameZone.on('pointerdown', () => {
          const newName = prompt(`Enter name for Player ${i + 1}:`, cfg.name);
          if (newName && newName.trim()) {
            this.playerConfigs[i].name = newName.trim().substring(0, 16);
            this.renderRows();
          }
        });
        // Pencil hint
        const pencil = this.add.text(nameText.x + nameText.width + 8, rowY + 32, '✏️', {
          fontFamily: 'Nunito', fontSize: '13px',
        }).setOrigin(0, 0.5).setAlpha(0.5);
        this.rowObjects.push(pencil, nameZone);
      }
    });

    // Active player count label
    const activeCount = this.playerConfigs.filter(p => p.active).length;
    const countLabel = this.add.text(W/2, this.panelY + 535,
      `${activeCount} player${activeCount !== 1 ? 's' : ''} • Tap + to add, − to remove`, {
        fontFamily: 'Nunito', fontSize: '13px', color: '#7755AA', fontStyle: 'italic',
      }).setOrigin(0.5);
    this.rowObjects.push(countLabel);
  }

  startGame() {
    const activePlayers = this.playerConfigs
      .filter(p => p.active)
      .map((p, idx) => ({
        name: p.name,
        isBot: p.isBot,
        colorIndex: this.playerConfigs.indexOf(p),
      }));

    if (activePlayers.length < 1) return;

    this.scene.start('Game', { players: activePlayers });
    this.scene.start('UI', { players: activePlayers });
    this.scene.bringToTop('UI');
  }
}
