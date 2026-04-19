import Phaser from 'phaser';
import {
  NUM_SPACES, COLOR_HEX, COLOR_HEX_STR, SPACE_COLORS,
  PLAYER_COLORS, PLAYER_COLORS_STR,
  getSpacePosition, getSpaceColor, SPECIAL_SPACES, LANDMARKS
} from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Generate all textures programmatically — no external assets needed
  }

  create() {
    this.generateTextures();
    this.scene.start('Title');
  }

  generateTextures() {
    this.generateBoardTexture();
    this.generateSpaceTextures();
    this.generateCardTextures();
    this.generatePlayerPieces();
    this.generateParticles();
    this.generateUI();
    this.generateBackgrounds();
  }

  // ─── BOARD ────────────────────────────────────────
  generateBoardTexture() {
    const W = 1024, H = 768;
    const rt = this.add.renderTexture(0, 0, W, H);
    const g = this.add.graphics();

    // Outer board frame
    g.fillStyle(0x2D0A4E, 1);
    g.fillRoundedRect(4, 4, W - 8, H - 8, 24);
    g.fillStyle(0x4A1080, 1);
    g.fillRoundedRect(10, 10, W - 20, H - 20, 20);

    // Board inner surface — rich deep purple/green fantasy
    g.fillStyle(0x0D1F2D, 1);
    g.fillRoundedRect(16, 16, W - 32, H - 32, 16);

    // Decorative corner stars
    const corners = [[40,40],[W-40,40],[40,H-40],[W-40,H-40]];
    corners.forEach(([cx,cy]) => {
      this.drawStar(g, cx, cy, 14, 6, 0xFFD166, 0.7);
    });

    // Path background glow
    g.fillStyle(0x1A0533, 0.5);
    g.fillRoundedRect(14, 14, 600, H - 28, 14);

    rt.draw(g, 0, 0);
    rt.saveTexture('board-bg');
    g.destroy();
    rt.destroy();
  }

  generateSpaceTextures() {
    // Regular color space
    SPACE_COLORS.forEach(color => {
      const hex = COLOR_HEX[color];
      const g = this.add.graphics();
      // Outer glow ring
      g.fillStyle(hex, 0.3);
      g.fillCircle(28, 28, 28);
      // Main circle
      g.fillStyle(hex, 1);
      g.fillCircle(28, 28, 22);
      // Highlight
      g.fillStyle(0xFFFFFF, 0.35);
      g.fillCircle(22, 22, 8);
      // Border
      g.lineStyle(3, 0xFFFFFF, 0.8);
      g.strokeCircle(28, 28, 22);
      g.generateTexture(`space-${color}`, 56, 56);
      g.destroy();
    });

    // Start space
    const sg = this.add.graphics();
    sg.fillStyle(0x888888, 0.3);
    sg.fillCircle(28, 28, 28);
    sg.fillStyle(0xEEEEEE, 1);
    sg.fillCircle(28, 28, 22);
    sg.fillStyle(0x666666, 0.2);
    sg.fillCircle(22, 22, 8);
    sg.lineStyle(3, 0xFFFFFF, 1);
    sg.strokeCircle(28, 28, 22);
    sg.generateTexture('space-start', 56, 56);
    sg.destroy();

    // End/crown space — gold
    const eg = this.add.graphics();
    for (let r = 0; r < 3; r++) {
      eg.fillStyle(0xFFD166, 0.15 + r*0.1);
      eg.fillCircle(36, 36, 36 - r*8);
    }
    eg.fillStyle(0xFFD166, 1);
    eg.fillCircle(36, 36, 26);
    eg.fillStyle(0xFFFFFF, 0.4);
    eg.fillCircle(28, 28, 10);
    eg.lineStyle(4, 0xFFF5CC, 1);
    eg.strokeCircle(36, 36, 26);
    eg.generateTexture('space-end', 72, 72);
    eg.destroy();

    // Special space — forward (teal glow)
    const fg = this.add.graphics();
    fg.fillStyle(0x2EC4B6, 0.3);
    fg.fillCircle(28, 28, 28);
    fg.fillStyle(0x2EC4B6, 1);
    fg.fillCircle(28, 28, 22);
    fg.fillStyle(0xFFFFFF, 0.4);
    fg.fillCircle(22, 22, 8);
    fg.lineStyle(3, 0x7FFFF4, 1);
    fg.strokeCircle(28, 28, 22);
    fg.generateTexture('space-forward', 56, 56);
    fg.destroy();

    // Special space — backward (red)
    const bg = this.add.graphics();
    bg.fillStyle(0xEF476F, 0.3);
    bg.fillCircle(28, 28, 28);
    bg.fillStyle(0xEF476F, 1);
    bg.fillCircle(28, 28, 22);
    bg.fillStyle(0xFFFFFF, 0.4);
    bg.fillCircle(22, 22, 8);
    bg.lineStyle(3, 0xFF9EB5, 1);
    bg.strokeCircle(28, 28, 22);
    bg.generateTexture('space-back', 56, 56);
    bg.destroy();

    // Special space — stuck (orange)
    const stg = this.add.graphics();
    stg.fillStyle(0xFF8C42, 0.3);
    stg.fillCircle(28, 28, 28);
    stg.fillStyle(0xFF8C42, 1);
    stg.fillCircle(28, 28, 22);
    stg.fillStyle(0xFFFFFF, 0.4);
    stg.fillCircle(22, 22, 8);
    stg.lineStyle(3, 0xFFCC99, 1);
    stg.strokeCircle(28, 28, 22);
    stg.generateTexture('space-stuck', 56, 56);
    stg.destroy();
  }

  generateCardTextures() {
    // Card back
    const cb = this.add.graphics();
    cb.fillStyle(0x2D0A4E, 1);
    cb.fillRoundedRect(0, 0, 100, 140, 12);
    cb.lineStyle(3, 0x9B6FE8, 1);
    cb.strokeRoundedRect(2, 2, 96, 136, 10);
    // Pattern
    for (let y = 10; y < 130; y += 12) {
      for (let x = 10; x < 90; x += 12) {
        cb.fillStyle(0x9B6FE8, 0.12);
        cb.fillCircle(x, y, 3);
      }
    }
    cb.lineStyle(2, 0xFFD166, 0.5);
    cb.strokeRoundedRect(8, 8, 84, 124, 7);
    cb.generateTexture('card-back', 100, 140);
    cb.destroy();

    // Color cards
    SPACE_COLORS.forEach(color => {
      const hex = COLOR_HEX[color];
      const cg = this.add.graphics();
      cg.fillStyle(0xFFFFFF, 1);
      cg.fillRoundedRect(0, 0, 100, 140, 12);
      cg.fillStyle(hex, 1);
      cg.fillRoundedRect(8, 8, 84, 60, 8);
      cg.fillStyle(hex, 0.15);
      cg.fillRoundedRect(8, 80, 84, 52, 8);
      cg.lineStyle(3, hex, 0.8);
      cg.strokeRoundedRect(2, 2, 96, 136, 10);
      cg.generateTexture(`card-${color}`, 100, 140);
      cg.destroy();

      // Double card
      const dg = this.add.graphics();
      dg.fillStyle(0xFFFFFF, 1);
      dg.fillRoundedRect(0, 0, 100, 140, 12);
      dg.fillStyle(hex, 1);
      dg.fillRoundedRect(8, 8, 36, 60, 8);
      dg.fillRoundedRect(56, 8, 36, 60, 8);
      dg.fillStyle(hex, 0.15);
      dg.fillRoundedRect(8, 80, 84, 52, 8);
      dg.lineStyle(3, hex, 0.8);
      dg.strokeRoundedRect(2, 2, 96, 136, 10);
      dg.generateTexture(`card-double-${color}`, 100, 140);
      dg.destroy();
    });

    // Location card (gold/special)
    const lg = this.add.graphics();
    lg.fillStyle(0xFFFAE6, 1);
    lg.fillRoundedRect(0, 0, 100, 140, 12);
    lg.fillStyle(0xFFD166, 1);
    lg.fillRoundedRect(8, 8, 84, 50, 8);
    for (let i = 0; i < 5; i++) {
      lg.fillStyle(0xFFD166, 0.15 - i*0.02);
      lg.fillRoundedRect(8, 8+i*2, 84-i*4, 50-i*2, 8);
    }
    lg.lineStyle(3, 0xFFD166, 1);
    lg.strokeRoundedRect(2, 2, 96, 136, 10);
    lg.lineStyle(2, 0xFFD166, 0.5);
    lg.strokeRoundedRect(6, 6, 88, 128, 8);
    lg.generateTexture('card-location', 100, 140);
    lg.destroy();
  }

  generatePlayerPieces() {
    PLAYER_COLORS.forEach((color, i) => {
      const g = this.add.graphics();
      const size = 20;
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(size+2, size*2+4, size*1.4, size*0.5);
      // Body peg shape
      g.fillStyle(color, 1);
      g.fillCircle(size, size, size - 2);
      g.fillStyle(color, 0.8);
      g.fillRect(size - 7, size, 14, 14);
      // Base
      g.fillEllipse(size, size+14, 20, 8);
      // Highlight
      g.fillStyle(0xFFFFFF, 0.45);
      g.fillCircle(size - 5, size - 5, 6);
      // Rim
      g.lineStyle(2, 0xFFFFFF, 0.7);
      g.strokeCircle(size, size, size - 2);
      g.generateTexture(`piece-${i}`, size * 2, size * 2 + 16);
      g.destroy();
    });
  }

  generateParticles() {
    // Sparkle particle
    const pg = this.add.graphics();
    pg.fillStyle(0xFFFFFF, 1);
    pg.fillCircle(8, 8, 8);
    pg.generateTexture('particle-sparkle', 16, 16);
    pg.destroy();

    // Star particle
    const sg = this.add.graphics();
    this.drawStar(sg, 8, 8, 8, 4, 0xFFD166, 1);
    sg.generateTexture('particle-star', 16, 16);
    sg.destroy();

    // Confetti pieces
    ['#FF6EB4','#9B6FE8','#2EC4B6','#FF8C42','#FFD166','#4ECDC4'].forEach((col, i) => {
      const cg = this.add.graphics();
      const c = Phaser.Display.Color.HexStringToColor(col).color;
      cg.fillStyle(c, 1);
      cg.fillRect(0, 0, 10, 6);
      cg.generateTexture(`confetti-${i}`, 10, 6);
      cg.destroy();
    });
  }

  generateUI() {
    // Panel background
    const pg = this.add.graphics();
    pg.fillStyle(0x1A0533, 0.97);
    pg.fillRoundedRect(0, 0, 280, 768, 0);
    pg.lineStyle(2, 0x9B6FE8, 0.4);
    pg.strokeRoundedRect(0, 0, 280, 768, 0);
    pg.generateTexture('ui-panel', 280, 768);
    pg.destroy();

    // Button textures
    const bColors = [
      { name: 'purple', fill: 0x9B6FE8, border: 0xC5A8FF },
      { name: 'pink',   fill: 0xFF6EB4, border: 0xFFAAD4 },
      { name: 'teal',   fill: 0x2EC4B6, border: 0x7FFFF4 },
      { name: 'gray',   fill: 0x3D2060, border: 0x6040A0 },
    ];
    bColors.forEach(({ name, fill, border }) => {
      const bg = this.add.graphics();
      bg.fillStyle(fill, 1);
      bg.fillRoundedRect(0, 0, 200, 52, 26);
      bg.lineStyle(2, border, 0.8);
      bg.strokeRoundedRect(1, 1, 198, 50, 25);
      bg.fillStyle(0xFFFFFF, 0.15);
      bg.fillRoundedRect(4, 4, 192, 20, 12);
      bg.generateTexture(`btn-${name}`, 200, 52);
      bg.destroy();

      // Hover version
      const bgh = this.add.graphics();
      bgh.fillStyle(fill, 0.8);
      bgh.fillRoundedRect(0, 0, 200, 52, 26);
      bgh.lineStyle(3, border, 1);
      bgh.strokeRoundedRect(1, 1, 198, 50, 25);
      bgh.generateTexture(`btn-${name}-hover`, 200, 52);
      bgh.destroy();
    });

    // Card slot
    const cs = this.add.graphics();
    cs.fillStyle(0x0D0824, 1);
    cs.fillRoundedRect(0, 0, 110, 150, 14);
    cs.lineStyle(2, 0x9B6FE8, 0.4);
    cs.strokeRoundedRect(1, 1, 108, 148, 13);
    cs.generateTexture('card-slot', 110, 150);
    cs.destroy();

    // Progress bar bg
    const pbg = this.add.graphics();
    pbg.fillStyle(0x0D0824, 1);
    pbg.fillRoundedRect(0, 0, 220, 16, 8);
    pbg.lineStyle(1, 0x9B6FE8, 0.4);
    pbg.strokeRoundedRect(0, 0, 220, 16, 8);
    pbg.generateTexture('progress-bg', 220, 16);
    pbg.destroy();
  }

  generateBackgrounds() {
    // Title background
    const g = this.add.graphics();
    g.fillStyle(0x0D0320, 1);
    g.fillRect(0, 0, 1024, 768);
    // Stars
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 768;
      const r = Math.random() * 2 + 0.5;
      const a = Math.random() * 0.8 + 0.2;
      g.fillStyle(0xFFFFFF, a);
      g.fillCircle(x, y, r);
    }
    g.generateTexture('title-bg', 1024, 768);
    g.destroy();

    // Gradient overlay
    const og = this.add.graphics();
    og.fillGradientStyle(0x9B6FE8, 0xFF6EB4, 0x2EC4B6, 0xFFD166, 0.15);
    og.fillRect(0, 0, 1024, 768);
    og.generateTexture('title-overlay', 1024, 768);
    og.destroy();
  }

  drawStar(g, cx, cy, outerR, innerR, color, alpha) {
    g.fillStyle(color, alpha);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) g.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      else g.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    g.closePath();
    g.fillPath();
  }
}
