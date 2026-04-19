import Phaser from 'phaser';
import {
  NUM_SPACES, COLOR_HEX, SPACE_COLORS,
  PLAYER_COLORS,
} from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this.generateTextures();
    this.scene.start('Title');
  }

  generateTextures() {
    this.generateBoardBackground();
    this.generateSquareTextures();
    this.generateCardTextures();
    this.generatePlayerPieces();
    this.generateParticles();
    this.generateUITextures();
    this.generateTitleBg();
  }

  // ─── BOARD BACKGROUND ─────────────────────────────────────────────────────
  generateBoardBackground() {
    const W = 630, H = 748;
    const g = this.add.graphics();

    // Deep fantasy sky
    g.fillStyle(0x080020, 1); g.fillRect(0, 0, W, H*0.6);
    g.fillStyle(0x0d0535, 1); g.fillRect(0, H*0.4, W, H*0.3);
    g.fillStyle(0x0a1f10, 1); g.fillRect(0, H*0.65, W, H*0.35);

    // Stars
    for (let i = 0; i < 130; i++) {
      const sx = Math.random()*W, sy = Math.random()*H*0.6;
      g.fillStyle(0xFFFFFF, Math.random()*0.7+0.2);
      g.fillCircle(sx, sy, Math.random()*1.6+0.3);
    }

    // Moon
    g.fillStyle(0x6633BB, 0.2); g.fillCircle(548, 72, 68);
    g.fillStyle(0xAA88FF, 0.3); g.fillCircle(548, 72, 50);
    g.fillStyle(0xE8DAFF, 0.85); g.fillCircle(548, 72, 34);
    g.fillStyle(0xDDCCFF, 0.25); g.fillCircle(538, 60, 10);
    g.fillStyle(0xDDCCFF, 0.2);  g.fillCircle(554, 80, 7);

    // Rainbow (subtle background arc)
    const rc = [0xFF0000,0xFF7700,0xFFFF00,0x00BB00,0x0055FF,0x7700FF];
    rc.forEach((col, ri) => {
      g.lineStyle(7, col, 0.18);
      g.beginPath();
      g.arc(315, H+50, 340+ri*10, Math.PI, Math.PI*2, false);
      g.strokePath();
    });

    // ── UNICORN ──────────────────────────────────────────
    this.drawUnicorn(g, 72, 110);

    // ── MERMAID ──────────────────────────────────────────
    this.drawMermaid(g, 570, 360);

    // ── K-POP STAGE ──────────────────────────────────────
    this.drawKPopStage(g, 315, 672);

    // ── FAIRY ────────────────────────────────────────────
    this.drawFairy(g, 494, 168);

    // ── SUPERHERO ────────────────────────────────────────
    this.drawSuperhero(g, 60, 410);

    // ── FLOWERS ──────────────────────────────────────────
    [[85,595],[120,655],[510,530],[558,615],[295,728],[415,710],[165,715],[540,460]].forEach(([fx,fy]) => {
      this.drawFlower(g, fx, fy);
    });

    // ── MUSHROOMS ────────────────────────────────────────
    this.drawMushroom(g, 48, 545);
    this.drawMushroom(g, 582, 490);
    this.drawMushroom(g, 290, 730);

    // ── SPARKLE DOTS ─────────────────────────────────────
    const scols = [0xFF6EB4,0xFFD166,0x9B6FE8,0x2EC4B6,0xFFFFFF,0x4ECDC4];
    for (let i = 0; i < 50; i++) {
      g.fillStyle(scols[i%scols.length], Math.random()*0.35+0.1);
      this.drawStarPoints(g, Math.random()*W, Math.random()*H, Math.random()*4+2, Math.random()*2+1);
    }

    // ── GRASS ground ─────────────────────────────────────
    g.fillStyle(0x0d3318, 1); g.fillRect(0, H-50, W, 50);
    for (let gx = 0; gx < W; gx += 16) {
      const gh = Math.random()*14+5;
      g.fillStyle(0x1a5c2e, 1);
      g.fillTriangle(gx, H-50, gx+8, H-50-gh, gx+16, H-50);
      g.fillStyle(0x22753a, 0.5);
      g.fillTriangle(gx+3, H-50, gx+9, H-50-gh*0.7, gx+16, H-50);
    }

    // Board border glow
    g.lineStyle(5, 0x9B6FE8, 0.3); g.strokeRect(5, 5, W-10, H-10);
    g.lineStyle(2, 0xFF6EB4, 0.15); g.strokeRect(9, 9, W-18, H-18);

    const rt = this.add.renderTexture(0, 0, W, H);
    rt.draw(g, 0, 0);
    rt.saveTexture('board-bg');
    g.destroy();
    rt.destroy();
  }

  drawUnicorn(g, x, y) {
    // Body
    g.fillStyle(0xF0E0FF, 0.88); g.fillEllipse(x, y, 72, 44);
    // Neck
    g.fillStyle(0xF0E0FF, 0.88); g.fillRect(x+18, y-22, 16, 20);
    // Head
    g.fillStyle(0xF0E0FF, 0.88); g.fillCircle(x+28, y-28, 18);
    // Snout
    g.fillStyle(0xFFCCDD, 0.8); g.fillEllipse(x+36, y-22, 12, 8);
    // Nostril
    g.fillStyle(0xFF99BB, 0.6); g.fillCircle(x+35, y-21, 2);
    // Horn
    g.fillStyle(0xFFD166, 0.95); g.fillTriangle(x+28, y-50, x+24, y-28, x+32, y-28);
    g.fillStyle(0xFF6EB4, 0.5);  g.fillTriangle(x+28, y-48, x+27, y-36, x+30, y-36);
    // Eye
    g.fillStyle(0x7744CC, 1); g.fillCircle(x+33, y-30, 3.5);
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(x+34, y-31, 1.2);
    // Mane
    [0xFF6EB4,0x9B6FE8,0x2EC4B6,0xFFD166,0xFF8C42].forEach((mc, mi) => {
      g.fillStyle(mc, 0.82);
      g.fillEllipse(x+18-mi*1.5, y-26+mi*4, 9, 16);
    });
    // Legs
    g.fillStyle(0xE8D0FF, 0.85);
    [[-22,10],[-10,12],[8,12],[20,10]].forEach(([lx,ly]) => {
      g.fillRect(x+lx-3, y+ly, 6, 20);
      g.fillStyle(0xFFD166, 0.9); g.fillEllipse(x+lx, y+ly+22, 9, 5);
      g.fillStyle(0xE8D0FF, 0.85);
    });
    // Tail
    [0xFF6EB4,0x9B6FE8,0xFFD166,0x2EC4B6].forEach((tc, ti) => {
      g.fillStyle(tc, 0.75);
      g.fillEllipse(x-36+ti*2, y+4+ti*5, 11, 30);
    });
    // Wings
    g.fillStyle(0xFF6EB4, 0.28); g.fillEllipse(x-8, y-10, 32, 18);
    g.fillStyle(0x9B6FE8, 0.25); g.fillEllipse(x+8, y-12, 32, 16);
    // Sparkles
    [[x+52,y-32],[x-42,y-8],[x+42,y+18]].forEach(([sx,sy]) => {
      g.fillStyle(0xFFD166, 0.85); this.drawStarPoints(g, sx, sy, 5, 2);
    });
  }

  drawMermaid(g, x, y) {
    // Tail
    g.fillStyle(0x2EC4B6, 0.88); g.fillEllipse(x, y+32, 28, 62);
    g.fillStyle(0x06D6A0, 0.65); g.fillEllipse(x-4, y+22, 14, 42);
    // Fin
    g.fillStyle(0x2EC4B6, 0.92);
    g.fillTriangle(x-22, y+60, x, y+50, x+22, y+60);
    g.fillStyle(0x4ECDC4, 0.55); g.fillTriangle(x-16, y+57, x, y+51, x+16, y+57);
    // Scales
    for (let si = 0; si < 5; si++) {
      g.fillStyle(0x4ECDC4, 0.28); g.fillEllipse(x-4, y+4+si*11, 11, 8);
      g.fillEllipse(x+4, y+10+si*11, 11, 8);
    }
    // Body
    g.fillStyle(0xFFDDEE, 0.88); g.fillEllipse(x, y-10, 26, 34);
    // Shell
    g.fillStyle(0xFF6EB4, 0.72); g.fillEllipse(x-6, y-8, 13, 9);
    g.fillEllipse(x+6, y-8, 13, 9);
    // Head
    g.fillStyle(0xFFDDCC, 0.92); g.fillCircle(x, y-34, 17);
    // Hair
    [0xFF6EB4,0x9B6FE8,0xFFD166].forEach((hc, hi) => {
      g.fillStyle(hc, 0.78); g.fillEllipse(x-8+hi*4, y-28+hi*3, 11, 24);
    });
    // Eyes
    g.fillStyle(0x2EC4B6, 1); g.fillCircle(x-5, y-35, 3); g.fillCircle(x+5, y-35, 3);
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(x-4, y-36, 1); g.fillCircle(x+6, y-36, 1);
    // Smile
    g.lineStyle(1.5, 0xFF6EB4, 0.9);
    g.beginPath(); g.arc(x, y-30, 5, 0.1, Math.PI-0.1); g.strokePath();
    // Arms
    g.fillStyle(0xFFDDCC, 0.82); g.fillEllipse(x-17, y-12, 8, 24); g.fillEllipse(x+17, y-12, 8, 24);
    // Bubbles
    [[x-22,y-55],[x+12,y-62],[x+26,y-42]].forEach(([bx,by]) => {
      g.lineStyle(1, 0x4ECDC4, 0.5); g.strokeCircle(bx, by, 4+Math.random()*3);
    });
    // Star accessories
    g.fillStyle(0xFFD166, 0.8); this.drawStarPoints(g, x+20, y-48, 5, 2.5);
  }

  drawKPopStage(g, x, y) {
    // Stage
    g.fillStyle(0x1a0044, 0.85); g.fillRect(x-85, y-12, 170, 25);
    g.fillStyle(0x9B6FE8, 0.6); g.fillRect(x-85, y-14, 170, 6);
    // Lights
    [0xFF6EB4,0xFFD166,0x2EC4B6,0xFF8C42,0x9B6FE8].forEach((lc, li) => {
      const lx = x-64+li*32;
      g.fillStyle(lc, 0.8); g.fillCircle(lx, y-14, 5);
      g.fillStyle(lc, 0.12); g.fillCircle(lx, y+6, 14);
    });
    // Three figures — Roomie, Mira, Zoey
    [[x-30,0xFF6EB4,'R'],[x,0x9B6FE8,'M'],[x+30,0x2EC4B6,'Z']].forEach(([fx,fc]) => {
      g.fillStyle(fc, 0.88); g.fillRect(fx-6, y-42, 12, 26);
      g.fillStyle(0xFFDDCC, 0.92); g.fillCircle(fx, y-48, 9);
      g.fillStyle(fc, 0.92); g.fillEllipse(fx, y-55, 15, 11);
      // Arms
      g.fillStyle(fc, 0.75); g.fillRect(fx-15, y-40, 9, 4); g.fillRect(fx+6, y-40, 9, 4);
      // Mic
      g.fillStyle(0xFFD166, 0.95); g.fillCircle(fx+12, y-40, 3.5);
      g.lineStyle(1.5, 0xDDDDDD, 0.7); g.lineBetween(fx+12, y-37, fx+12, y-28);
      // Legs
      g.fillStyle(fc, 0.7); g.fillRect(fx-5, y-16, 4, 14); g.fillRect(fx+1, y-16, 4, 14);
    });
    // Music notes
    [[x-52,y-58,0xFF6EB4],[x+50,y-63,0xFFD166],[x+5,y-70,0x9B6FE8],[x-20,y-75,0x2EC4B6]].forEach(([nx,ny,nc]) => {
      g.fillStyle(nc, 0.7); g.fillCircle(nx, ny, 4);
      g.fillRect(nx+3, ny-11, 2, 11);
      g.fillRect(nx+3, ny-11, 8, 2);
    });
    // Stage sparkles
    for (let si = 0; si < 7; si++) {
      g.fillStyle(0xFFFFFF, 0.35);
      this.drawStarPoints(g, x-70+si*24, y-65, 4, 1.8);
    }
  }

  drawFairy(g, x, y) {
    // Wings
    g.fillStyle(0xFF6EB4, 0.3); g.fillEllipse(x-20, y-5, 30, 20);
    g.fillStyle(0x9B6FE8, 0.3); g.fillEllipse(x+20, y-5, 30, 20);
    g.fillStyle(0xFF6EB4, 0.2); g.fillEllipse(x-15, y+10, 22, 15);
    g.fillStyle(0x9B6FE8, 0.2); g.fillEllipse(x+15, y+10, 22, 15);
    g.lineStyle(1, 0xFF6EB4, 0.45); g.strokeEllipse(x-20, y-5, 30, 20); g.strokeEllipse(x+20, y-5, 30, 20);
    // Body
    g.fillStyle(0x9B6FE8, 0.85); g.fillRect(x-5, y, 10, 18);
    g.fillStyle(0xFF6EB4, 0.82); g.fillEllipse(x, y+16, 20, 12);
    // Head
    g.fillStyle(0xFFDDCC, 0.92); g.fillCircle(x, y-10, 11);
    g.fillStyle(0xFFD166, 0.88); g.fillEllipse(x, y-15, 18, 12);
    g.fillEllipse(x-9, y-7, 7, 16);
    // Eyes
    g.fillStyle(0x9B6FE8, 1); g.fillCircle(x-3, y-11, 2.2); g.fillCircle(x+3, y-11, 2.2);
    // Wand
    g.lineStyle(2, 0xFFD166, 0.85); g.lineBetween(x+7, y+2, x+20, y-14);
    g.fillStyle(0xFFD166, 1); this.drawStarPoints(g, x+20, y-14, 7, 3);
    // Dust
    for (let i = 0; i < 10; i++) {
      g.fillStyle(0xFFD166, Math.random()*0.5+0.2);
      g.fillCircle(x+16+i*2, y-12+i*1.5, Math.random()*2.5+0.5);
    }
  }

  drawSuperhero(g, x, y) {
    // Cape
    g.fillStyle(0xFF6EB4, 0.75); g.fillEllipse(x, y+20, 40, 50);
    // Body
    g.fillStyle(0x9B6FE8, 0.88); g.fillRect(x-10, y-10, 20, 30);
    // Emblem star
    g.fillStyle(0xFFD166, 0.9); this.drawStarPoints(g, x, y+5, 8, 4);
    // Head
    g.fillStyle(0xFFDDCC, 0.92); g.fillCircle(x, y-20, 14);
    // Mask
    g.fillStyle(0x9B6FE8, 0.85); g.fillRect(x-13, y-24, 26, 10);
    g.fillStyle(0x9B6FE8, 0.0);
    // Eyes through mask
    g.fillStyle(0xFFFFFF, 1); g.fillEllipse(x-5, y-20, 7, 5); g.fillEllipse(x+5, y-20, 7, 5);
    // Hair
    g.fillStyle(0xFF6EB4, 0.85); g.fillEllipse(x, y-32, 22, 14);
    // Arms extended (heroic pose)
    g.fillStyle(0x9B6FE8, 0.8);
    g.fillRect(x-30, y-14, 20, 7);
    g.fillRect(x+10, y-14, 20, 7);
    // Fists
    g.fillStyle(0xFFDDCC, 0.85); g.fillCircle(x-32, y-11, 5); g.fillCircle(x+32, y-11, 5);
    // Boots
    g.fillStyle(0x7744CC, 0.85); g.fillRect(x-12, y+18, 10, 14); g.fillRect(x+2, y+18, 10, 14);
    // Speed lines
    g.lineStyle(2, 0xFF6EB4, 0.3);
    [-8,-3,2].forEach((ly) => g.lineBetween(x-50, y+ly, x-30, y+ly));
  }

  drawFlower(g, x, y) {
    const petalColors = [0xFF6EB4,0x9B6FE8,0xFF8C42,0x2EC4B6,0xFFD166,0xEF476F];
    const color = petalColors[Math.floor(Math.random()*petalColors.length)];
    const size = Math.random()*7+8;
    g.lineStyle(2, 0x1a5c2e, 0.8); g.lineBetween(x, y, x+Math.random()*6-3, y+size*1.4);
    for (let p = 0; p < 6; p++) {
      const angle = (p/6)*Math.PI*2;
      g.fillStyle(color, 0.78);
      g.fillEllipse(x+Math.cos(angle)*size*0.85, y+Math.sin(angle)*size*0.85, size, size*0.5);
    }
    g.fillStyle(0xFFD166, 1); g.fillCircle(x, y, size*0.38);
    g.fillStyle(0xFFFFFF, 0.4); g.fillCircle(x-1, y-1, size*0.15);
  }

  drawMushroom(g, x, y) {
    g.fillStyle(0xF5E6D0, 0.82); g.fillRect(x-7, y, 14, 18);
    g.fillStyle(0xFF6EB4, 0.88); g.fillEllipse(x, y-2, 38, 24);
    g.fillStyle(0xCC3388, 1); g.fillEllipse(x, y+3, 36, 16);
    g.fillStyle(0xFFFFFF, 0.75); g.fillCircle(x-9, y-2, 4.5); g.fillCircle(x+7, y-7, 3.5); g.fillCircle(x+11, y+2, 3);
  }

  drawStarPoints(g, x, y, outer, inner) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i%2===0 ? outer : inner;
      const a = (i*Math.PI/5)-Math.PI/2;
      pts.push({x: x+r*Math.cos(a), y: y+r*Math.sin(a)});
    }
    g.fillPoints(pts, true);
  }

  // ─── CANDYLAND-STYLE SQUARE TEXTURES ─────────────────────────────────────
  generateSquareTextures() {
    const W = 46, H = 36;

    SPACE_COLORS.forEach(color => {
      const hex = COLOR_HEX[color];
      const g = this.add.graphics();
      // Main fill
      g.fillStyle(hex, 1); g.fillRoundedRect(0, 0, W, H, 7);
      // Top shine band
      g.fillStyle(0xFFFFFF, 0.28); g.fillRoundedRect(3, 3, W-6, 11, 4);
      // Shine dot
      g.fillStyle(0xFFFFFF, 0.45); g.fillCircle(9, 8, 4.5);
      // Bottom shadow
      g.fillStyle(0x000000, 0.12); g.fillRoundedRect(3, H-9, W-6, 6, 3);
      // White border
      g.lineStyle(3, 0xFFFFFF, 0.92); g.strokeRoundedRect(1.5, 1.5, W-3, H-3, 6);
      // Dark outer
      g.lineStyle(1.5, 0x000000, 0.18); g.strokeRoundedRect(0.5, 0.5, W-1, H-1, 7);
      g.generateTexture(`sq-${color}`, W, H);
      g.destroy();
    });

    // Start
    const sg = this.add.graphics();
    sg.fillStyle(0xF5F0FF, 1); sg.fillRoundedRect(0, 0, 58, H, 7);
    sg.fillStyle(0x9B6FE8, 0.18); sg.fillRoundedRect(3, 3, 52, 11, 4);
    sg.lineStyle(3, 0x9B6FE8, 0.85); sg.strokeRoundedRect(1.5, 1.5, 55, H-3, 6);
    sg.generateTexture('sq-start', 58, H);
    sg.destroy();

    // End — crown
    const eg = this.add.graphics();
    eg.fillStyle(0x6B1FBB, 1); eg.fillRoundedRect(0, 0, 58, 58, 14);
    eg.fillStyle(0xFFD166, 0.2); eg.fillRoundedRect(5, 5, 48, 48, 10);
    eg.lineStyle(4, 0xFFD166, 1); eg.strokeRoundedRect(2, 2, 54, 54, 12);
    eg.lineStyle(2, 0xFFD166, 0.4); eg.strokeRoundedRect(7, 7, 44, 44, 8);
    eg.generateTexture('sq-end', 58, 58);
    eg.destroy();

    // Forward
    const fg = this.add.graphics();
    fg.fillStyle(0x2EC4B6, 1); fg.fillRoundedRect(0, 0, W, H, 7);
    fg.fillStyle(0xFFFFFF, 0.28); fg.fillRoundedRect(3, 3, W-6, 11, 4);
    fg.lineStyle(3, 0x7FFFF4, 1); fg.strokeRoundedRect(1.5, 1.5, W-3, H-3, 6);
    fg.fillStyle(0xFFFFFF, 0.92);
    fg.fillTriangle(W/2, 5, W/2-7, 18, W/2+7, 18);
    fg.fillRect(W/2-3, 17, 6, 12);
    fg.generateTexture('sq-forward', W, H);
    fg.destroy();

    // Back
    const bg2 = this.add.graphics();
    bg2.fillStyle(0xEF476F, 1); bg2.fillRoundedRect(0, 0, W, H, 7);
    bg2.fillStyle(0xFFFFFF, 0.28); bg2.fillRoundedRect(3, 3, W-6, 11, 4);
    bg2.lineStyle(3, 0xFF9EB5, 1); bg2.strokeRoundedRect(1.5, 1.5, W-3, H-3, 6);
    bg2.fillStyle(0xFFFFFF, 0.92);
    bg2.fillRect(W/2-3, 8, 6, 12);
    bg2.fillTriangle(W/2, H-5, W/2-7, H-18, W/2+7, H-18);
    bg2.generateTexture('sq-back', W, H);
    bg2.destroy();

    // Stuck
    const stg = this.add.graphics();
    stg.fillStyle(0xFF8C42, 1); stg.fillRoundedRect(0, 0, W, H, 7);
    stg.fillStyle(0xFFFFFF, 0.28); stg.fillRoundedRect(3, 3, W-6, 11, 4);
    stg.lineStyle(3, 0xFFCC99, 1); stg.strokeRoundedRect(1.5, 1.5, W-3, H-3, 6);
    stg.lineStyle(3.5, 0xFFFFFF, 0.9);
    stg.lineBetween(11, 9, W-11, H-9); stg.lineBetween(W-11, 9, 11, H-9);
    stg.generateTexture('sq-stuck', W, H);
    stg.destroy();
  }

  generateCardTextures() {
    const cb = this.add.graphics();
    cb.fillStyle(0x2D0A4E, 1); cb.fillRoundedRect(0, 0, 100, 140, 12);
    cb.lineStyle(3, 0x9B6FE8, 1); cb.strokeRoundedRect(2, 2, 96, 136, 10);
    for (let y = 10; y < 130; y += 12) {
      for (let x = 10; x < 90; x += 12) {
        cb.fillStyle(0x9B6FE8, 0.12); cb.fillCircle(x, y, 3);
      }
    }
    cb.lineStyle(2, 0xFFD166, 0.5); cb.strokeRoundedRect(8, 8, 84, 124, 7);
    cb.generateTexture('card-back', 100, 140);
    cb.destroy();

    SPACE_COLORS.forEach(color => {
      const hex = COLOR_HEX[color];
      const cg = this.add.graphics();
      cg.fillStyle(0xFFFFFF, 1); cg.fillRoundedRect(0, 0, 100, 140, 12);
      cg.fillStyle(hex, 1); cg.fillRoundedRect(8, 8, 84, 55, 8);
      cg.fillStyle(0xFFFFFF, 0.25); cg.fillRoundedRect(10, 10, 80, 18, 6);
      cg.fillStyle(hex, 0.12); cg.fillRoundedRect(8, 78, 84, 54, 8);
      cg.lineStyle(3, hex, 0.8); cg.strokeRoundedRect(2, 2, 96, 136, 10);
      cg.generateTexture(`card-${color}`, 100, 140);
      cg.destroy();

      const dg = this.add.graphics();
      dg.fillStyle(0xFFFFFF, 1); dg.fillRoundedRect(0, 0, 100, 140, 12);
      dg.fillStyle(hex, 1); dg.fillRoundedRect(8, 8, 36, 55, 8); dg.fillRoundedRect(56, 8, 36, 55, 8);
      dg.fillStyle(0xFFFFFF, 0.25); dg.fillRoundedRect(10, 10, 32, 18, 6); dg.fillRoundedRect(58, 10, 32, 18, 6);
      dg.fillStyle(hex, 0.12); dg.fillRoundedRect(8, 78, 84, 54, 8);
      dg.lineStyle(3, hex, 0.8); dg.strokeRoundedRect(2, 2, 96, 136, 10);
      dg.generateTexture(`card-double-${color}`, 100, 140);
      dg.destroy();
    });

    const lg = this.add.graphics();
    lg.fillStyle(0xFFFAE6, 1); lg.fillRoundedRect(0, 0, 100, 140, 12);
    lg.fillStyle(0xFFD166, 1); lg.fillRoundedRect(8, 8, 84, 50, 8);
    lg.fillStyle(0xFFFFFF, 0.3); lg.fillRoundedRect(10, 10, 80, 18, 6);
    lg.lineStyle(3, 0xFFD166, 1); lg.strokeRoundedRect(2, 2, 96, 136, 10);
    lg.lineStyle(2, 0xFFD166, 0.5); lg.strokeRoundedRect(6, 6, 88, 128, 8);
    lg.generateTexture('card-location', 100, 140);
    lg.destroy();
  }

  generatePlayerPieces() {
    PLAYER_COLORS.forEach((color, i) => {
      const g = this.add.graphics();
      const s = 20;
      g.fillStyle(0x000000, 0.2); g.fillEllipse(s+2, s*2+3, s*1.2, 6);
      g.fillStyle(color, 1); g.fillCircle(s, s, s-2);
      g.fillRect(s-6, s-2, 12, 14);
      g.fillEllipse(s, s+13, 18, 8);
      g.fillStyle(0xFFFFFF, 0.42); g.fillCircle(s-5, s-5, 6);
      g.lineStyle(2, 0xFFFFFF, 0.72); g.strokeCircle(s, s, s-2);
      g.generateTexture(`piece-${i}`, s*2, s*2+16);
      g.destroy();
    });
  }

  generateParticles() {
    const pg = this.add.graphics();
    pg.fillStyle(0xFFFFFF, 1); pg.fillCircle(8, 8, 8);
    pg.generateTexture('particle-sparkle', 16, 16);
    pg.destroy();

    const sg = this.add.graphics();
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i%2===0 ? 8 : 4;
      const a = (i*Math.PI/5)-Math.PI/2;
      pts.push({x:8+r*Math.cos(a), y:8+r*Math.sin(a)});
    }
    sg.fillStyle(0xFFD166, 1); sg.fillPoints(pts, true);
    sg.generateTexture('particle-star', 16, 16);
    sg.destroy();

    ['#FF6EB4','#9B6FE8','#2EC4B6','#FF8C42','#FFD166','#4ECDC4'].forEach((col, i) => {
      const cg = this.add.graphics();
      cg.fillStyle(Phaser.Display.Color.HexStringToColor(col).color, 1);
      cg.fillRect(0, 0, 10, 6);
      cg.generateTexture(`confetti-${i}`, 10, 6);
      cg.destroy();
    });
  }

  generateUITextures() {
    [
      {name:'purple', fill:0x9B6FE8, border:0xC5A8FF},
      {name:'pink',   fill:0xFF6EB4, border:0xFFAAD4},
      {name:'teal',   fill:0x2EC4B6, border:0x7FFFF4},
      {name:'gray',   fill:0x3D2060, border:0x6040A0},
    ].forEach(({name, fill, border}) => {
      const bg = this.add.graphics();
      bg.fillStyle(fill, 1); bg.fillRoundedRect(0, 0, 200, 52, 26);
      bg.lineStyle(2, border, 0.8); bg.strokeRoundedRect(1, 1, 198, 50, 25);
      bg.fillStyle(0xFFFFFF, 0.15); bg.fillRoundedRect(4, 4, 192, 20, 12);
      bg.generateTexture(`btn-${name}`, 200, 52);
      bg.destroy();
    });

    const cs = this.add.graphics();
    cs.fillStyle(0x0D0824, 1); cs.fillRoundedRect(0, 0, 110, 150, 14);
    cs.lineStyle(2, 0x9B6FE8, 0.4); cs.strokeRoundedRect(1, 1, 108, 148, 13);
    cs.generateTexture('card-slot', 110, 150);
    cs.destroy();
  }

  generateTitleBg() {
    const g = this.add.graphics();
    g.fillStyle(0x0D0320, 1); g.fillRect(0, 0, 1024, 768);
    for (let i = 0; i < 200; i++) {
      g.fillStyle(0xFFFFFF, Math.random()*0.8+0.2);
      g.fillCircle(Math.random()*1024, Math.random()*768, Math.random()*2+0.5);
    }
    g.generateTexture('title-bg', 1024, 768);
    g.destroy();

    const og = this.add.graphics();
    og.fillGradientStyle(0x9B6FE8, 0xFF6EB4, 0x2EC4B6, 0xFFD166, 0.15);
    og.fillRect(0, 0, 1024, 768);
    og.generateTexture('title-overlay', 1024, 768);
    og.destroy();
  }
}
