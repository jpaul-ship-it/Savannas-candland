import Phaser from 'phaser';
import { PLAYER_COLORS_STR, PLAYER_EMOJIS } from '../utils/constants.js';

export class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }

  init(data) {
    this.winner = data.winner || { name: 'Player 1', colorIndex: 0, isBot: false };
  }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, W, H);
    this.tweens.add({ targets: overlay, fillAlpha: 0.75, duration: 600 });

    // Win panel
    const panelW = 560, panelH = 440;
    const panelX = W/2 - panelW/2, panelY = H/2 - panelH/2;

    const pg = this.add.graphics();
    pg.fillStyle(0x1A0533, 0);
    pg.fillRoundedRect(panelX, panelY, panelW, panelH, 28);
    this.tweens.add({ targets: pg, fillAlpha: 0.98, duration: 500 });

    pg.lineStyle(3, Phaser.Display.Color.HexStringToColor(PLAYER_COLORS_STR[this.winner.colorIndex]).color, 1);
    pg.strokeRoundedRect(panelX, panelY, panelW, panelH, 28);

    // Crown emoji
    const crown = this.add.text(W/2, panelY + 60, '👑🌟', {
      fontFamily: 'Nunito', fontSize: '64px',
    }).setOrigin(0.5).setScale(0).setAlpha(0);

    // Win text
    const winText = this.add.text(W/2, panelY + 145, `${this.winner.name} Wins!`, {
      fontFamily: 'Fredoka One', fontSize: '52px',
      color: PLAYER_COLORS_STR[this.winner.colorIndex],
      stroke: '#FFFFFF', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    const subText = this.add.text(W/2, panelY + 210,
      `${this.winner.isBot ? '🤖 The bot' : PLAYER_EMOJIS[this.winner.colorIndex] + ' ' + this.winner.name} reached the\nPurple Crystal Crown! ✨`,
      {
        fontFamily: 'Nunito', fontSize: '22px', fontStyle: 'bold',
        color: '#C5A8FF', align: 'center', lineSpacing: 6,
      }
    ).setOrigin(0.5).setAlpha(0);

    const magicText = this.add.text(W/2, panelY + 278, '🦄 🧜‍♀️ 🎤 🧚 🦸‍♀️ 🌸', {
      fontFamily: 'Nunito', fontSize: '32px',
    }).setOrigin(0.5).setAlpha(0);

    // Buttons
    const playAgainBg = this.add.image(W/2 - 110, panelY + 358, 'btn-gray').setScale(0.9).setAlpha(0);
    const playAgainText = this.add.text(W/2 - 110, panelY + 358, '↩ Play Again', {
      fontFamily: 'Fredoka One', fontSize: '20px', color: '#C5A8FF',
    }).setOrigin(0.5).setAlpha(0);

    const homeBg = this.add.image(W/2 + 110, panelY + 358, 'btn-purple').setScale(0.9).setAlpha(0);
    const homeText = this.add.text(W/2 + 110, panelY + 358, '🏠 Home', {
      fontFamily: 'Fredoka One', fontSize: '20px', color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({ targets: crown, scale: 1, alpha: 1, duration: 600, ease: 'Back.out', delay: 300 });
    this.tweens.add({ targets: winText, alpha: 1, y: panelY + 148, duration: 500, ease: 'Power2', delay: 600 });
    this.tweens.add({ targets: subText, alpha: 1, duration: 500, delay: 900 });
    this.tweens.add({ targets: magicText, alpha: 1, duration: 500, delay: 1100 });
    this.tweens.add({ targets: [playAgainBg, playAgainText, homeBg, homeText], alpha: 1, duration: 400, delay: 1300 });

    // Crown float
    this.tweens.add({
      targets: crown, y: '-=10', duration: 1800,
      ease: 'Sine.inOut', yoyo: true, repeat: -1, delay: 900,
    });

    // Win name rainbow color cycle
    this.time.addEvent({
      delay: 300, repeat: -1,
      callback: () => {
        const colors = ['#FF6EB4','#9B6FE8','#2EC4B6','#FFD166','#FF8C42','#4ECDC4'];
        winText.setStyle({ color: colors[Math.floor(Date.now()/300) % colors.length] });
      }
    });

    // Confetti
    this.time.delayedCall(400, () => this.launchConfetti());

    // Buttons
    playAgainBg.setInteractive({ useHandCursor: true });
    playAgainBg.on('pointerdown', () => {
      this.clearConfetti();
      this.scene.start('Setup');
    });
    playAgainBg.on('pointerover', () => this.tweens.add({ targets: [playAgainBg, playAgainText], scaleX: 0.95, scaleY: 0.95, duration: 100 }));
    playAgainBg.on('pointerout',  () => this.tweens.add({ targets: [playAgainBg, playAgainText], scaleX: 0.9, scaleY: 0.9,   duration: 100 }));

    homeBg.setInteractive({ useHandCursor: true });
    homeBg.on('pointerdown', () => {
      this.clearConfetti();
      this.scene.start('Title');
    });
    homeBg.on('pointerover', () => this.tweens.add({ targets: [homeBg, homeText], scaleX: 0.95, scaleY: 0.95, duration: 100 }));
    homeBg.on('pointerout',  () => this.tweens.add({ targets: [homeBg, homeText], scaleX: 0.9,  scaleY: 0.9,  duration: 100 }));
  }

  launchConfetti() {
    const W = this.scale.width;
    this.confettiEmitters = [];
    const colors = [0xFF6EB4, 0x9B6FE8, 0x2EC4B6, 0xFF8C42, 0xFFD166, 0x4ECDC4, 0xFFFFFF, 0xEF476F];

    colors.forEach((col, i) => {
      const e = this.add.particles(
        Phaser.Math.Between(0, W), -10,
        `confetti-${i % 6}`, {
          x: { min: 0, max: W },
          y: { min: -20, max: -5 },
          speedX: { min: -80, max: 80 },
          speedY: { min: 150, max: 400 },
          rotate: { min: 0, max: 360 },
          scale: { start: 1, end: 0.8 },
          alpha: { start: 1, end: 0.3 },
          lifespan: { min: 2000, max: 4000 },
          quantity: 2,
          frequency: 80,
          tint: col,
        }
      );
      e.setDepth(100);
      this.confettiEmitters.push(e);
    });
  }

  clearConfetti() {
    if (this.confettiEmitters) {
      this.confettiEmitters.forEach(e => e.destroy());
    }
  }
}
