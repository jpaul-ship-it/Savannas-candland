import Phaser from 'phaser';
import {
  NUM_SPACES, SPACE_COLORS, COLOR_HEX, COLOR_HEX_STR,
  PLAYER_COLORS, PLAYER_COLORS_STR, PLAYER_EMOJIS,
  LANDMARKS, SPECIAL_SPACES,
  getSpacePosition, getSpaceColor,
  buildDeck,
} from '../utils/constants.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.playerData = data.players || [
      { name: 'Player 1', isBot: false, colorIndex: 0 },
      { name: 'Player 2', isBot: true,  colorIndex: 1 },
    ];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.BOARD_X = 18;
    this.BOARD_Y = 10;
    this.BOARD_W = 620;
    this.BOARD_H = H - 20;

    // Game state
    this.currentPlayer = 0;
    this.animating = false;
    this.gameOver = false;
    this.deck = buildDeck();
    this.drawnCard = null;

    // Init players
    this.players = this.playerData.map((pd, i) => ({
      name: pd.name,
      isBot: pd.isBot,
      colorIndex: pd.colorIndex,
      pos: 0,
      stuckTurns: 0,
      pieceSprite: null,
    }));

    this.createBoard();
    this.createPieces();
    this.createParticleSystems();

    // Listen for draw card event from UI scene
    this.events.on('drawCard', this.handleDrawCard, this);
    this.game.events.on('drawCard', this.handleDrawCard, this);

    // Notify UI scene game is ready
    this.time.delayedCall(300, () => {
      this.game.events.emit('gameReady', {
        players: this.players,
        currentPlayer: this.currentPlayer,
      });
      this.startTurn();
    });
  }

  // ─── BOARD ────────────────────────────────────────

  createBoard() {
    const g = this.add.graphics();

    // Board background
    g.fillStyle(0x0D1A2D, 1);
    g.fillRoundedRect(this.BOARD_X, this.BOARD_Y, this.BOARD_W, this.BOARD_H, 20);
    g.lineStyle(3, 0x9B6FE8, 0.5);
    g.strokeRoundedRect(this.BOARD_X, this.BOARD_Y, this.BOARD_W, this.BOARD_H, 20);

    // Inner border
    g.lineStyle(1, 0x9B6FE8, 0.2);
    g.strokeRoundedRect(this.BOARD_X+6, this.BOARD_Y+6, this.BOARD_W-12, this.BOARD_H-12, 16);

    // Draw path connections first
    this.drawPathConnections(g);

    // Draw special space arrows
    this.drawSpecialArrows(g);

    // Draw spaces
    this.spaceSprites = [];
    for (let i = 0; i < NUM_SPACES; i++) {
      this.drawSpace(i);
    }

    // Draw landmark banners
    this.drawLandmarks();

    // Corner decorations
    this.drawCornerDecorations(g);
  }

  drawPathConnections(g) {
    g.lineStyle(18, 0x1A0A2E, 1);
    g.beginPath();
    for (let i = 0; i < NUM_SPACES; i++) {
      const p = this.getPos(i);
      if (i === 0) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
    }
    g.strokePath();

    g.lineStyle(12, 0x261444, 1);
    g.beginPath();
    for (let i = 0; i < NUM_SPACES; i++) {
      const p = this.getPos(i);
      if (i === 0) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
    }
    g.strokePath();
  }

  drawSpecialArrows(g) {
    SPECIAL_SPACES.forEach(sp => {
      if (sp.type !== 'forward' && sp.type !== 'back') return;
      const a = this.getPos(sp.space);
      const b = this.getPos(sp.target);
      const color = sp.type === 'forward' ? 0x2EC4B6 : 0xEF476F;

      g.lineStyle(2, color, 0.6);
      // Curved arrow
      const mx = (a.x + b.x) / 2;
      const my = Math.min(a.y, b.y) - 50;

      // Draw bezier approximation
      const steps = 20;
      g.beginPath();
      for (let t = 0; t <= steps; t++) {
        const tt = t / steps;
        const x = (1-tt)*(1-tt)*a.x + 2*(1-tt)*tt*mx + tt*tt*b.x;
        const y = (1-tt)*(1-tt)*a.y + 2*(1-tt)*tt*my + tt*tt*b.y;
        if (t === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.strokePath();

      // Arrowhead at target
      const prevT = 0.9;
      const px = (1-prevT)*(1-prevT)*a.x + 2*(1-prevT)*prevT*mx + prevT*prevT*b.x;
      const py = (1-prevT)*(1-prevT)*a.y + 2*(1-prevT)*prevT*my + prevT*prevT*b.y;
      const angle = Math.atan2(b.y - py, b.x - px);
      g.fillStyle(color, 0.8);
      g.fillTriangle(
        b.x + Math.cos(angle) * 8, b.y + Math.sin(angle) * 8,
        b.x + Math.cos(angle + 2.4) * 8, b.y + Math.sin(angle + 2.4) * 8,
        b.x + Math.cos(angle - 2.4) * 8, b.y + Math.sin(angle - 2.4) * 8,
      );
    });
  }

  drawSpace(i) {
    const {x, y} = this.getPos(i);
    const sp = SPECIAL_SPACES.find(s => s.space === i);
    const isStart = i === 0;
    const isEnd = i === NUM_SPACES - 1;

    let texKey;
    if (isStart) texKey = 'space-start';
    else if (isEnd) texKey = 'space-end';
    else if (sp && sp.type === 'forward') texKey = 'space-forward';
    else if (sp && sp.type === 'back') texKey = 'space-back';
    else if (sp && sp.type === 'stuck') texKey = 'space-stuck';
    else texKey = `space-${SPACE_COLORS[i % SPACE_COLORS.length]}`;

    const size = isEnd ? 1.3 : 1;
    const img = this.add.image(x, y, texKey).setScale(size);
    this.spaceSprites.push(img);

    // Labels for start/end
    if (isStart) {
      this.add.text(x, y, 'START', {
        fontFamily: 'Fredoka One', fontSize: '9px', color: '#666666',
      }).setOrigin(0.5);
    }
  }

  drawLandmarks() {
    LANDMARKS.forEach((lm, idx) => {
      if (lm.space === 0 || lm.space === NUM_SPACES - 1) return;
      const {x, y} = this.getPos(lm.space);

      // Small emoji above space
      this.add.text(x, y - 30, lm.emoji, {
        fontFamily: 'Nunito', fontSize: '18px',
      }).setOrigin(0.5);

      // Name tag
      const lines = lm.name.split('\n');
      const tagW = 70, tagH = lines.length * 14 + 8;
      const tagX = x + 28, tagY = y;

      const tg = this.add.graphics();
      const c = lm.color;
      tg.fillStyle(c, 0.9);
      tg.fillRoundedRect(tagX - tagW/2, tagY - tagH/2, tagW, tagH, 6);
      tg.lineStyle(1.5, 0xFFFFFF, 0.6);
      tg.strokeRoundedRect(tagX - tagW/2, tagY - tagH/2, tagW, tagH, 6);

      lines.forEach((line, li) => {
        this.add.text(tagX, tagY - (lines.length-1)*7 + li*14, line, {
          fontFamily: 'Nunito', fontSize: '9px', fontStyle: 'bold', color: '#FFFFFF',
        }).setOrigin(0.5);
      });
    });
  }

  drawCornerDecorations(g) {
    const W = this.BOARD_W, H = this.BOARD_H;
    const ox = this.BOARD_X, oy = this.BOARD_Y;
    const corners = [[ox+24, oy+24],[ox+W-24, oy+24],[ox+24, oy+H-24],[ox+W-24, oy+H-24]];
    const colors = [0xFF6EB4, 0xFFD166, 0x2EC4B6, 0x9B6FE8];
    corners.forEach(([cx,cy], i) => {
      g.fillStyle(colors[i], 0.5);
      this.drawStarGfx(g, cx, cy, 14, 6, colors[i], 0.7);
    });
  }

  drawStarGfx(g, cx, cy, outerR, innerR, color, alpha) {
    g.fillStyle(color, alpha);
    const points = [];
    for (let j = 0; j < 10; j++) {
      const r = j % 2 === 0 ? outerR : innerR;
      const angle = (j * Math.PI / 5) - Math.PI / 2;
      points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
    g.fillPoints(points, true);
  }

  // ─── PIECES ───────────────────────────────────────

  createPieces() {
    this.players.forEach((player, i) => {
      const {x, y} = this.getPos(0);
      const offsetX = (i % 2 === 0 ? -8 : 8);
      const offsetY = (i < 2 ? -8 : 8);
      const sprite = this.add.image(x + offsetX, y + offsetY, `piece-${player.colorIndex}`);
      sprite.setScale(1.1);
      sprite.setDepth(10 + i);
      player.pieceSprite = sprite;
      player.offsetX = offsetX;
      player.offsetY = offsetY;

      // Shadow under piece
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.2);
      shadow.fillEllipse(x + offsetX, y + offsetY + 18, 28, 8);
      shadow.setDepth(9 + i);
      player.shadow = shadow;
    });
  }

  createParticleSystems() {
    // Sparkle burst for landing
    this.sparkleEmitter = this.add.particles(0, 0, 'particle-sparkle', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 12,
      emitting: false,
      tint: [0xFF6EB4, 0x9B6FE8, 0xFFD166, 0x2EC4B6, 0xFFFFFF],
    });
    this.sparkleEmitter.setDepth(50);

    // Trail emitter
    this.trailEmitter = this.add.particles(0, 0, 'particle-sparkle', {
      speed: { min: 10, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 400,
      quantity: 2,
      frequency: 60,
      emitting: false,
      tint: [0xFFD166, 0xFFFFFF],
    });
    this.trailEmitter.setDepth(48);
  }

  // ─── TURN LOGIC ───────────────────────────────────

  startTurn() {
    if (this.gameOver) return;
    const player = this.players[this.currentPlayer];

    this.game.events.emit('turnStart', {
      player,
      playerIndex: this.currentPlayer,
      canDraw: true,
    });

    if (player.stuckTurns > 0) {
      player.stuckTurns--;
      this.time.delayedCall(800, () => {
        this.game.events.emit('log', `${player.name} is stuck! ${player.stuckTurns} turn(s) left.`);
        this.game.events.emit('status', `${PLAYER_EMOJIS[player.colorIndex]} ${player.name} is stuck!`);
        this.time.delayedCall(1500, () => this.endTurn());
      });
      return;
    }

    if (player.isBot) {
      this.time.delayedCall(Phaser.Math.Between(900, 1600), () => {
        this.handleDrawCard();
      });
    }
  }

  handleDrawCard() {
    if (this.animating || this.gameOver) return;
    const player = this.players[this.currentPlayer];
    if (player.stuckTurns > 0) return;

    this.animating = true;
    this.game.events.emit('canDraw', false);

    if (this.deck.length === 0) {
      this.deck = buildDeck();
      this.game.events.emit('log', '🔄 Deck reshuffled!');
    }

    const card = this.deck.pop();
    this.drawnCard = card;
    this.game.events.emit('cardDrawn', card);

    this.time.delayedCall(700, () => {
      this.processCard(card, player);
    });
  }

  processCard(card, player) {
    let targetPos = player.pos;
    let logMsg = '';

    if (card.type === 'location') {
      const dest = card.space;
      targetPos = dest;
      logMsg = `${player.name} flies to ${card.emoji} ${card.name}!`;
    } else if (card.type === 'double') {
      targetPos = this.findColorSpace(player.pos, card.color, 2);
      logMsg = `${player.name} draws DOUBLE ${card.color}! Big move ahead!`;
    } else {
      targetPos = this.findColorSpace(player.pos, card.color, 1);
      logMsg = `${player.name} draws ${card.color}!`;
    }

    targetPos = Math.min(targetPos, NUM_SPACES - 1);
    this.game.events.emit('log', logMsg);
    this.game.events.emit('status', logMsg);

    this.movePlayer(player, targetPos, () => {
      const sp = SPECIAL_SPACES.find(s => s.space === player.pos && player.pos > 0);
      if (sp) {
        this.time.delayedCall(500, () => this.applySpecial(sp, player));
      } else {
        this.checkWin(player);
      }
    });
  }

  findColorSpace(fromPos, color, count) {
    let found = 0;
    for (let i = fromPos + 1; i < NUM_SPACES; i++) {
      if (SPACE_COLORS[i % SPACE_COLORS.length] === color) {
        found++;
        if (found === count) return i;
      }
    }
    return NUM_SPACES - 1;
  }

  applySpecial(sp, player) {
    const msg = `${sp.emoji} ${sp.label} — ${sp.desc}`;
    this.game.events.emit('log', msg);
    this.game.events.emit('status', msg);
    this.game.events.emit('specialSpace', sp);

    // Flash the space
    const spaceSprite = this.spaceSprites[sp.space];
    if (spaceSprite) {
      this.tweens.add({
        targets: spaceSprite,
        scaleX: 1.5, scaleY: 1.5,
        duration: 200, yoyo: true, repeat: 2,
      });
    }

    if (sp.type === 'stuck') {
      player.stuckTurns = sp.turns;
      this.cameras.main.shake(400, 0.008);
      this.time.delayedCall(1500, () => this.checkWin(player));
    } else {
      this.time.delayedCall(1000, () => {
        this.movePlayer(player, sp.target, () => {
          this.checkWin(player);
        });
      });
    }
  }

  checkWin(player) {
    if (player.pos >= NUM_SPACES - 1) {
      this.gameOver = true;
      this.game.events.emit('log', `🌟 ${player.name} reached the Purple Crystal Crown!`);
      this.sparkleEmitter.setPosition(this.getPos(NUM_SPACES-1).x, this.getPos(NUM_SPACES-1).y);
      this.sparkleEmitter.explode(40);
      this.time.delayedCall(1000, () => {
        this.scene.start('Win', { winner: player });
        this.scene.stop('UI');
      });
      return;
    }
    this.animating = false;
    this.game.events.emit('updateScores', this.players);
    this.time.delayedCall(400, () => this.endTurn());
  }

  endTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.game.events.emit('turnStart', {
      player: this.players[this.currentPlayer],
      playerIndex: this.currentPlayer,
      canDraw: this.players[this.currentPlayer].stuckTurns === 0,
    });
    this.time.delayedCall(300, () => this.startTurn());
  }

  // ─── MOVEMENT ─────────────────────────────────────

  movePlayer(player, targetPos, onComplete) {
    if (targetPos === player.pos) {
      onComplete();
      return;
    }

    const direction = targetPos > player.pos ? 1 : -1;
    const positions = [];
    let cur = player.pos;
    while (cur !== targetPos) {
      cur += direction;
      positions.push(cur);
    }

    this.animateMoveAlongPath(player, positions, 0, onComplete);
  }

  animateMoveAlongPath(player, positions, posIdx, onComplete) {
    if (posIdx >= positions.length) {
      this.sparkleEmitter.setPosition(player.pieceSprite.x, player.pieceSprite.y);
      this.sparkleEmitter.explode(16);
      this.cameras.main.shake(150, 0.003);
      onComplete();
      return;
    }

    const nextSpace = positions[posIdx];
    const {x, y} = this.getPos(nextSpace);
    const targetX = x + player.offsetX;
    const targetY = y + player.offsetY;

    // Emit trail
    this.trailEmitter.setPosition(player.pieceSprite.x, player.pieceSprite.y);
    this.trailEmitter.start();

    const jumpHeight = -24;
    const duration = Math.max(160, 280 - positions.length * 8);

    // Arc jump tween
    this.tweens.add({
      targets: player.pieceSprite,
      x: targetX,
      duration: duration,
      ease: 'Linear',
    });
    this.tweens.add({
      targets: player.pieceSprite,
      y: targetY + jumpHeight,
      duration: duration / 2,
      ease: 'Sine.out',
      yoyo: false,
      onComplete: () => {
        this.tweens.add({
          targets: player.pieceSprite,
          y: targetY,
          duration: duration / 2,
          ease: 'Bounce.out',
          onComplete: () => {
            // Update shadow
            player.shadow.clear();
            player.shadow.fillStyle(0x000000, 0.2);
            player.shadow.fillEllipse(targetX, targetY + 18, 28, 8);

            player.pos = nextSpace;

            // Small bounce on piece
            this.tweens.add({
              targets: player.pieceSprite,
              scaleX: 1.25, scaleY: 0.85,
              duration: 60, yoyo: true,
            });

            this.trailEmitter.stop();

            this.time.delayedCall(posIdx < positions.length - 1 ? 20 : 60, () => {
              this.animateMoveAlongPath(player, positions, posIdx + 1, onComplete);
            });
          }
        });
      }
    });
  }

  // ─── HELPERS ──────────────────────────────────────

  getPos(spaceIndex) {
    // Snake path within board bounds
    const COLS = 9;
    const ROWS = Math.ceil(NUM_SPACES / COLS);
    const CELL_W = (this.BOARD_W - 40) / COLS;
    const CELL_H = (this.BOARD_H - 40) / ROWS;
    const row = Math.floor(spaceIndex / COLS);
    const col = spaceIndex % COLS;
    const flipped = row % 2 === 1;
    const actualCol = flipped ? (COLS - 1 - col) : col;
    const x = this.BOARD_X + 20 + actualCol * CELL_W + CELL_W / 2;
    const y = this.BOARD_Y + 20 + (ROWS - 1 - row) * CELL_H + CELL_H / 2;
    return { x, y };
  }
}
