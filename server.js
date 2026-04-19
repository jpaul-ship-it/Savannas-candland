import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Background
    this.add.image(W/2, H/2, 'title-bg');
    this.add.image(W/2, H/2, 'title-overlay');

    // Floating sparkles
    this.sparkleEmitter = this.add.particles(0, 0, 'particle-sparkle', {
      x: { min: 0, max: W },
      y: { min: 0, max: H },
      quantity: 1,
      frequency: 120,
      lifespan: 3000,
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.3, end: 0 },
      tint: [0xFF6EB4, 0x9B6FE8, 0xFFD166, 0x2EC4B6],
      speed: { min: 20, max: 60 },
      angle: { min: 240, max: 300 },
    });

    // Logo shadow
    const titleShadow = this.add.text(W/2 + 4, H/2 - 110 + 4, "✨ Savanna's\nMagical World ✨", {
      fontFamily: 'Fredoka One',
      fontSize: '68px',
      color: '#000000',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0.3);

    // Logo main
    const title = this.add.text(W/2, H/2 - 110, "✨ Savanna's\nMagical World ✨", {
      fontFamily: 'Fredoka One',
      fontSize: '68px',
      color: '#FFFFFF',
      align: 'center',
      lineSpacing: 8,
      stroke: '#9B6FE8',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle
    const sub = this.add.text(W/2, H/2 + 30, 'A Magical Candyland Adventure!', {
      fontFamily: 'Nunito',
      fontSize: '24px',
      color: '#FFD166',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Emoji row
    const emojis = this.add.text(W/2, H/2 + 80, '🦄  🧜‍♀️  🎤  👑  🧚  🦸‍♀️', {
      fontFamily: 'Nunito',
      fontSize: '36px',
    }).setOrigin(0.5).setAlpha(0);

    // Start button
    const btnBg = this.add.image(W/2, H/2 + 175, 'btn-purple').setAlpha(0).setScale(1.2);
    const btnText = this.add.text(W/2, H/2 + 175, '🌈  Start Game', {
      fontFamily: 'Fredoka One',
      fontSize: '28px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    // Credits
    const credits = this.add.text(W/2, H - 28, 'Made with ✨ for Savanna', {
      fontFamily: 'Nunito',
      fontSize: '14px',
      color: '#9B6FE8',
    }).setOrigin(0.5).setAlpha(0.6);

    // Animate in
    this.tweens.add({ targets: title, y: H/2 - 120, duration: 800, ease: 'Back.out', delay: 100 });
    this.tweens.add({ targets: titleShadow, y: H/2 - 116, duration: 800, ease: 'Back.out', delay: 100 });
    this.tweens.add({ targets: sub, alpha: 1, y: H/2 + 25, duration: 600, ease: 'Power2', delay: 500 });
    this.tweens.add({ targets: emojis, alpha: 1, duration: 600, delay: 700 });
    this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 600, delay: 900 });

    // Float title
    this.tweens.add({
      targets: [title, titleShadow],
      y: '-=12',
      duration: 2200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1000,
    });

    // Pulse emojis
    this.tweens.add({
      targets: emojis,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Button interaction
    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerover', () => {
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.25, scaleY: 1.25, duration: 120, ease: 'Power2' });
    });
    btnBg.on('pointerout', () => {
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.2, scaleY: 1.2, duration: 120, ease: 'Power2' });
    });
    btnBg.on('pointerdown', () => {
      this.cameras.main.flash(300, 155, 100, 232);
      this.time.delayedCall(200, () => this.scene.start('Setup'));
    });

    // Shoot stars periodically
    this.time.addEvent({
      delay: 2500,
      loop: true,
      callback: () => this.shootStar(),
    });
  }

  shootStar() {
    const W = this.scale.width;
    const star = this.add.image(
      Phaser.Math.Between(-50, W + 50),
      Phaser.Math.Between(-20, 200),
      'particle-star'
    ).setScale(0.6).setAlpha(0.9).setTint(0xFFD166);

    this.tweens.add({
      targets: star,
      x: star.x + Phaser.Math.Between(200, 400),
      y: star.y + Phaser.Math.Between(100, 300),
      alpha: 0,
      scale: 0,
      duration: Phaser.Math.Between(1200, 2200),
      ease: 'Power2',
      onComplete: () => star.destroy(),
    });
  }
}
