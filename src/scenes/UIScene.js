import Phaser from 'phaser';
import { PLAYER_COLORS_STR, PLAYER_EMOJIS, COLOR_HEX_STR, SPACE_COLORS } from '../utils/constants.js';

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UI', active: false }); }

  init(data) {
    this.playerData = data.players || [];
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.UI_X = 640;
    this.UI_W = W - this.UI_X;
    this.canDraw = false;
    this.currentPlayerIndex = 0;

    this.createPanel();
    this.createPlayerChips();
    this.createCardArea();
    this.createStatusBox();
    this.createDrawButton();
    this.createLog();
    this.createProgressBars();

    // Listen to game events
    this.game.events.on('gameReady',    this.onGameReady,    this);
    this.game.events.on('turnStart',    this.onTurnStart,    this);
    this.game.events.on('cardDrawn',    this.onCardDrawn,    this);
    this.game.events.on('log',          this.addLog,         this);
    this.game.events.on('status',       this.setStatus,      this);
    this.game.events.on('canDraw',      this.setCanDraw,     this);
    this.game.events.on('specialSpace', this.onSpecialSpace, this);
    this.game.events.on('updateScores', this.updateProgress, this);
  }

  createPanel() {
    const H = this.scale.height;
    const g = this.add.graphics();
    // Panel bg
    g.fillStyle(0x0D0320, 1);
    g.fillRect(this.UI_X, 0, this.UI_W, H);
    // Left border glow
    g.lineStyle(3, 0x9B6FE8, 0.6);
    g.lineBetween(this.UI_X, 0, this.UI_X, H);
    // Header bar
    g.fillStyle(0x1A0533, 1);
    g.fillRect(this.UI_X, 0, this.UI_W, 50);
    g.lineStyle(1, 0x9B6FE8, 0.3);
    g.lineBetween(this.UI_X, 50, this.UI_X + this.UI_W, 50);

    this.add.text(this.UI_X + this.UI_W/2, 25, '✨ Magical World', {
      fontFamily: 'Fredoka One', fontSize: '18px', color: '#C5A8FF',
    }).setOrigin(0.5);
  }

  createPlayerChips() {
    this.chipContainer = this.add.container(this.UI_X + 8, 58);
    this.chips = [];
    this.playerData.forEach((pd, i) => {
      const chipY = i * 64;
      const g = this.add.graphics();
      const col = Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[pd.colorIndex]).color;

      g.fillStyle(0x1A0533, 1);
      g.fillRoundedRect(0, chipY, this.UI_W - 16, 58, 12);
      g.lineStyle(2, col, 0.4);
      g.strokeRoundedRect(0, chipY, this.UI_W - 16, 58, 12);

      const avatar = this.add.graphics();
      avatar.fillStyle(col, 1);
      avatar.fillCircle(26, chipY + 29, 20);
      avatar.lineStyle(2, 0xFFFFFF, 0.4);
      avatar.strokeCircle(26, chipY + 29, 20);

      const emoji = this.add.text(26, chipY + 29, PLAYER_EMOJIS[pd.colorIndex], {
        fontFamily: 'Nunito', fontSize: '16px',
      }).setOrigin(0.5);

      const nameText = this.add.text(52, chipY + 16, pd.name + (pd.isBot ? ' 🤖' : ''), {
        fontFamily: 'Nunito', fontSize: '13px', fontStyle: 'bold', color: '#FFFFFF',
      }).setOrigin(0, 0.5);

      const posText = this.add.text(52, chipY + 34, 'Space 0', {
        fontFamily: 'Nunito', fontSize: '11px', color: '#9B6FE8',
      }).setOrigin(0, 0.5);

      this.chipContainer.add([g, avatar, emoji, nameText, posText]);
      this.chips.push({ g, nameText, posText, avatar, col, colorIndex: pd.colorIndex });
    });
  }

  createCardArea() {
    const H = this.scale.height;
    const cardAreaY = 58 + this.playerData.length * 64 + 14;
    this.cardAreaY = cardAreaY;

    // Section label
    this.add.text(this.UI_X + this.UI_W/2, cardAreaY, 'DRAW A CARD', {
      fontFamily: 'Nunito', fontSize: '11px', fontStyle: 'bold',
      color: '#5533AA', letterSpacing: 2,
    }).setOrigin(0.5);

    // Card slot
    this.cardSlot = this.add.image(this.UI_X + this.UI_W/2, cardAreaY + 92, 'card-slot');

    // Card image (shown after draw)
    this.cardImage = this.add.image(this.UI_X + this.UI_W/2, cardAreaY + 92, 'card-back')
      .setScale(1.05);

    // Card text overlays
    this.cardEmoji = this.add.text(this.UI_X + this.UI_W/2, cardAreaY + 72, '🃏', {
      fontFamily: 'Nunito', fontSize: '32px',
    }).setOrigin(0.5);

    this.cardNameText = this.add.text(this.UI_X + this.UI_W/2, cardAreaY + 108, 'Draw a card!', {
      fontFamily: 'Nunito', fontSize: '11px', fontStyle: 'bold',
      color: '#9B6FE8', align: 'center', wordWrap: { width: 90 },
    }).setOrigin(0.5);

    this.cardTypeText = this.add.text(this.UI_X + this.UI_W/2, cardAreaY + 125, '', {
      fontFamily: 'Nunito', fontSize: '10px', color: '#FFD166',
    }).setOrigin(0.5);
  }

  createStatusBox() {
    const statusY = this.cardAreaY + 165;
    const g = this.add.graphics();
    g.fillStyle(0x1A0533, 1);
    g.fillRoundedRect(this.UI_X + 8, statusY, this.UI_W - 16, 60, 12);
    g.lineStyle(1.5, 0x9B6FE8, 0.4);
    g.strokeRoundedRect(this.UI_X + 8, statusY, this.UI_W - 16, 60, 12);

    this.statusText = this.add.text(this.UI_X + this.UI_W/2, statusY + 30, 'Get ready!', {
      fontFamily: 'Nunito', fontSize: '13px', fontStyle: 'bold',
      color: '#FFFFFF', align: 'center',
      wordWrap: { width: this.UI_W - 32 },
    }).setOrigin(0.5);
  }

  createDrawButton() {
    const btnY = this.cardAreaY + 242;
    this.drawBtnBg = this.add.image(this.UI_X + this.UI_W/2, btnY, 'btn-pink').setScale(0.88);
    this.drawBtnText = this.add.text(this.UI_X + this.UI_W/2, btnY, '🎴 Draw Card', {
      fontFamily: 'Fredoka One', fontSize: '20px', color: '#FFFFFF',
    }).setOrigin(0.5);

    this.drawBtnBg.setInteractive({ useHandCursor: true });
    this.drawBtnBg.on('pointerdown', () => {
      if (!this.canDraw) return;
      this.tweens.add({ targets: [this.drawBtnBg, this.drawBtnText], scaleX: 0.83, scaleY: 0.83, duration: 80, yoyo: true });
      this.game.events.emit('drawCard');
    });
    this.drawBtnBg.on('pointerover', () => {
      if (this.canDraw) this.tweens.add({ targets: [this.drawBtnBg, this.drawBtnText], scaleX: 0.92, scaleY: 0.92, duration: 100 });
    });
    this.drawBtnBg.on('pointerout', () => {
      const s = this.canDraw ? 0.88 : 0.75;
      this.tweens.add({ targets: [this.drawBtnBg, this.drawBtnText], scaleX: s, scaleY: s, duration: 100 });
    });

    this.setCanDraw(false);
  }

  createProgressBars() {
    const progY = this.cardAreaY + 282;
    this.add.text(this.UI_X + this.UI_W/2, progY, 'PROGRESS', {
      fontFamily: 'Nunito', fontSize: '11px', fontStyle: 'bold',
      color: '#5533AA', letterSpacing: 2,
    }).setOrigin(0.5);

    this.progressBars = this.playerData.map((pd, i) => {
      const barY = progY + 18 + i * 28;
      const barX = this.UI_X + 10;
      const barW = this.UI_W - 20;

      const bg = this.add.graphics();
      bg.fillStyle(0x1A0533, 1);
      bg.fillRoundedRect(barX, barY, barW, 18, 9);
      bg.lineStyle(1, 0x3D1B66, 1);
      bg.strokeRoundedRect(barX, barY, barW, 18, 9);

      const fill = this.add.graphics();
      const col = Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[pd.colorIndex]).color;
      fill.fillStyle(col, 0.85);
      fill.fillRoundedRect(barX + 2, barY + 2, 1, 14, 7);

      const label = this.add.text(barX + barW - 4, barY + 9, '0%', {
        fontFamily: 'Nunito', fontSize: '10px', color: PLAYER_COLORS_STR[pd.colorIndex],
      }).setOrigin(1, 0.5);

      return { fill, label, barX, barY, barW, col };
    });
  }

  createLog() {
    const H = this.scale.height;
    const logY = H - 180;

    this.add.text(this.UI_X + this.UI_W/2, logY - 14, 'GAME LOG', {
      fontFamily: 'Nunito', fontSize: '11px', fontStyle: 'bold',
      color: '#5533AA', letterSpacing: 2,
    }).setOrigin(0.5);

    const logBg = this.add.graphics();
    logBg.fillStyle(0x0A0220, 1);
    logBg.fillRoundedRect(this.UI_X + 8, logY, this.UI_W - 16, 168, 10);
    logBg.lineStyle(1, 0x3D1B66, 1);
    logBg.strokeRoundedRect(this.UI_X + 8, logY, this.UI_W - 16, 168, 10);

    this.logLines = [];
    this.logY = logY + 10;
    for (let i = 0; i < 8; i++) {
      const t = this.add.text(this.UI_X + 14, this.logY + i * 19, '', {
        fontFamily: 'Nunito', fontSize: '11px', color: i === 0 ? '#FFFFFF' : '#6644AA',
        wordWrap: { width: this.UI_W - 28 },
      });
      this.logLines.push(t);
    }
  }

  // ─── EVENT HANDLERS ───────────────────────────────

  onGameReady(data) {
    this.setStatus(`${PLAYER_EMOJIS[data.players[0].colorIndex]} ${data.players[0].name}'s turn!`);
    this.updateProgress(data.players);
  }

  onTurnStart(data) {
    this.currentPlayerIndex = data.playerIndex;

    // Highlight active chip
    this.chips.forEach((chip, i) => {
      chip.g.clear();
      const isActive = i === data.playerIndex;
      const col = Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[chip.colorIndex]).color;
      chip.g.fillStyle(isActive ? 0x2D0A4E : 0x1A0533, 1);
      chip.g.fillRoundedRect(0, i * 64, this.UI_W - 16, 58, 12);
      chip.g.lineStyle(2, col, isActive ? 1.0 : 0.3);
      chip.g.strokeRoundedRect(0, i * 64, this.UI_W - 16, 58, 12);
      if (isActive) {
        // Pulse
        this.tweens.add({
          targets: chip.g,
          alpha: 0.85,
          duration: 500,
          yoyo: true,
          repeat: 2,
          onComplete: () => chip.g.setAlpha(1),
        });
      }
    });

    this.setCanDraw(data.canDraw && !data.player.isBot);
    this.setStatus(`${PLAYER_EMOJIS[data.player.colorIndex]} ${data.player.name}'s turn!`);
  }

  onCardDrawn(card) {
    this.setCanDraw(false);
    const inner = this.cardImage;

    // Flip animation
    this.tweens.add({
      targets: [inner, this.cardEmoji, this.cardNameText, this.cardTypeText],
      scaleX: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        // Update card visuals
        let texKey = 'card-back';
        let emoji = '🃏';
        let name = '';
        let typeTxt = '';
        let colorHex = '#9B6FE8';

        if (card.type === 'location') {
          texKey = 'card-location';
          emoji = card.emoji;
          name = card.name;
          typeTxt = '⭐ Location Card!';
          colorHex = card.colorStr || '#FFD166';
        } else if (card.type === 'double') {
          texKey = `card-double-${card.color}`;
          emoji = '✨✨';
          name = `Double ${card.color.charAt(0).toUpperCase()+card.color.slice(1)}`;
          typeTxt = 'Double Move!';
          colorHex = COLOR_HEX_STR[card.color];
        } else {
          texKey = `card-${card.color}`;
          emoji = this.getColorEmoji(card.color);
          name = card.color.charAt(0).toUpperCase() + card.color.slice(1);
          typeTxt = 'Move Forward';
          colorHex = COLOR_HEX_STR[card.color];
        }

        inner.setTexture(texKey);
        this.cardEmoji.setText(emoji);
        this.cardNameText.setText(name).setStyle({ color: colorHex });
        this.cardTypeText.setText(typeTxt);

        // Flip back
        this.tweens.add({
          targets: [inner, this.cardEmoji, this.cardNameText, this.cardTypeText],
          scaleX: 1,
          duration: 150,
          ease: 'Back.out',
        });

        // Card bounce
        this.tweens.add({
          targets: [inner, this.cardEmoji],
          y: '-=8',
          duration: 200,
          ease: 'Back.out',
          yoyo: true,
        });
      }
    });
  }

  onSpecialSpace(sp) {
    const colors = { forward: '#2EC4B6', back: '#EF476F', stuck: '#FF8C42' };
    this.setStatus(`${sp.emoji} ${sp.label}!`);
    this.statusText.setStyle({ color: colors[sp.type] || '#FFFFFF' });
    this.time.delayedCall(1500, () => {
      this.statusText.setStyle({ color: '#FFFFFF' });
    });
  }

  updateProgress(players) {
    const NUM_SPACES = 72;
    players.forEach((player, i) => {
      if (!this.progressBars[i]) return;
      const bar = this.progressBars[i];
      const pct = player.pos / (NUM_SPACES - 1);
      const maxW = bar.barW - 4;

      bar.fill.clear();
      bar.fill.fillStyle(bar.col, 0.85);
      bar.fill.fillRoundedRect(bar.barX + 2, bar.barY + 2, Math.max(1, pct * maxW), 14, 7);
      bar.label.setText(Math.round(pct * 100) + '%');

      // Update chip position text
      if (this.chips[i]) {
        this.chips[i].posText.setText(`Space ${player.pos} / ${NUM_SPACES - 1}`);
      }
    });
  }

  setCanDraw(val) {
    this.canDraw = val;
    const scale = val ? 0.88 : 0.75;
    this.drawBtnBg.setScale(scale);
    this.drawBtnText.setScale(scale);
    this.drawBtnBg.setAlpha(val ? 1 : 0.45);
    this.drawBtnText.setAlpha(val ? 1 : 0.45);
  }

  setStatus(msg) {
    this.statusText.setText(msg);
    this.tweens.add({
      targets: this.statusText,
      scaleX: 1.05, scaleY: 1.05,
      duration: 120, yoyo: true,
    });
  }

  addLog(msg) {
    // Shift lines down
    for (let i = this.logLines.length - 1; i > 0; i--) {
      this.logLines[i].setText(this.logLines[i-1].text);
      this.logLines[i].setStyle({ color: '#4A2A88' });
    }
    this.logLines[0].setText(msg).setStyle({ color: '#FFFFFF' });

    // Flash newest
    this.tweens.add({
      targets: this.logLines[0],
      alpha: 0.5,
      duration: 200,
      yoyo: true,
    });
  }

  getColorEmoji(color) {
    const map = { pink:'🩷', purple:'💜', teal:'💚', orange:'🧡', yellow:'💛', blue:'💙' };
    return map[color] || '🃏';
  }
}
