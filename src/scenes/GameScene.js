import Phaser from 'phaser';
import {
  NUM_SPACES, SPACE_COLORS, COLOR_HEX,
  PLAYER_COLORS, PLAYER_EMOJIS,
  LANDMARKS, SPECIAL_SPACES,
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
    this.BOARD_X = 10;
    this.BOARD_Y = 8;
    this.BOARD_W = 622;
    this.BOARD_H = 752;

    // Game state
    this.currentPlayer = 0;
    this.animating = false;
    this.gameOver = false;
    this.deck = buildDeck();
    this.drawnCard = null;

    this.players = this.playerData.map((pd) => ({
      name: pd.name,
      isBot: pd.isBot,
      colorIndex: pd.colorIndex,
      pos: 0,
      stuckTurns: 0,
      pieceSprite: null,
      shadow: null,
      offsetX: 0,
      offsetY: 0,
    }));

    // Build the path coordinates first
    this.pathCoords = this.buildCandylandPath();

    this.createBoard();
    this.createPieces();
    this.createParticleSystems();

    this.game.events.on('drawCard', this.handleDrawCard, this);

    this.time.delayedCall(300, () => {
      this.game.events.emit('gameReady', {
        players: this.players,
        currentPlayer: this.currentPlayer,
      });
      this.startTurn();
    });
  }

  // ─── PATH GEOMETRY — real Candyland winding snake ─────────────────────────
  buildCandylandPath() {
    // Build a winding path that fills the board area
    // The real Candyland board has ~10 squares per row in a snake pattern
    // Squares are rectangular, connected side-by-side with no gaps

    const SQ_W = 46, SQ_H = 36;
    const GAP = 2; // tiny gap between squares for visibility
    const MARGIN_X = 22;
    const MARGIN_Y = 18;

    const BW = this.BOARD_W - MARGIN_X * 2;

    // How many squares fit per row
    const perRow = Math.floor(BW / (SQ_W + GAP)); // ~12

    const coords = [];
    const totalRows = Math.ceil(NUM_SPACES / perRow);

    for (let i = 0; i < NUM_SPACES; i++) {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const flipped = row % 2 === 1;
      const actualCol = flipped ? (perRow - 1 - col) : col;

      // Y goes from bottom to top (start at bottom)
      const x = this.BOARD_X + MARGIN_X + actualCol * (SQ_W + GAP) + SQ_W / 2;
      const y = this.BOARD_Y + this.BOARD_H - MARGIN_Y - row * (SQ_H + GAP + 2) - SQ_H / 2;

      coords.push({ x, y, w: SQ_W, h: SQ_H, row, col: actualCol });
    }

    return coords;
  }

  // ─── BOARD DRAWING ────────────────────────────────────────────────────────
  createBoard() {
    // Draw illustrated background
    this.add.image(this.BOARD_X + this.BOARD_W/2, this.BOARD_Y + this.BOARD_H/2, 'board-bg')
      .setDisplaySize(this.BOARD_W, this.BOARD_H);

    const g = this.add.graphics();

    // Draw special-space arc connectors
    this.drawSpecialArrows(g);

    // Draw path row connectors (rounded caps connecting rows)
    this.drawRowConnectors(g);

    // Draw all squares
    this.squareImages = [];
    this.squareEmojis = [];
    for (let i = 0; i < NUM_SPACES; i++) {
      this.drawSquare(i, g);
    }

    // Draw landmark banners over their squares
    this.drawLandmarkBanners();
  }

  drawRowConnectors(g) {
    // Draw curved connectors at the end of each row (the "U-turn" sections)
    const SQ_H = 36, GAP_H = 4;
    const perRow = 12;
    const MARGIN_X = 22, MARGIN_Y = 18;

    const totalRows = Math.ceil(NUM_SPACES / perRow);

    for (let row = 0; row < totalRows - 1; row++) {
      const isFlipped = row % 2 === 1;
      const lastInRow = Math.min((row + 1) * perRow - 1, NUM_SPACES - 1);
      const firstInNextRow = (row + 1) * perRow;
      if (firstInNextRow >= NUM_SPACES) break;

      const a = this.pathCoords[lastInRow];
      const b = this.pathCoords[firstInNextRow];

      // Draw a filled rounded rect connecting the two rows
      const minX = Math.min(a.x, b.x) - a.w/2;
      const maxX = Math.max(a.x, b.x) + a.w/2;
      const midY = (a.y + b.y) / 2;
      const connH = Math.abs(b.y - a.y) + SQ_H;

      g.fillStyle(0x000000, 0.08);
      g.fillRoundedRect(
        isFlipped ? minX - 6 : maxX - 14,
        midY - connH/2,
        20, connH, 10
      );

      // Color connector strip
      const colorA = this.getSquareColor(lastInRow);
      const colorB = this.getSquareColor(firstInNextRow);
      g.fillStyle(colorA, 0.7);
      g.fillRoundedRect(
        isFlipped ? minX - 4 : maxX - 12,
        midY - connH/2 + 2,
        16, connH - 4, 8
      );
    }
  }

  drawSpecialArrows(g) {
    SPECIAL_SPACES.forEach(sp => {
      if (sp.type !== 'forward' && sp.type !== 'back') return;
      const a = this.pathCoords[sp.space];
      const b = this.pathCoords[sp.target];
      if (!a || !b) return;

      const color = sp.type === 'forward' ? 0x2EC4B6 : 0xEF476F;
      const alpha = 0.55;

      g.lineStyle(3, color, alpha);
      // Control point above the midpoint
      const mx = (a.x + b.x) / 2;
      const my = Math.min(a.y, b.y) - 55;

      const steps = 24;
      g.beginPath();
      for (let t = 0; t <= steps; t++) {
        const tt = t / steps;
        const px = (1-tt)*(1-tt)*a.x + 2*(1-tt)*tt*mx + tt*tt*b.x;
        const py = (1-tt)*(1-tt)*a.y + 2*(1-tt)*tt*my + tt*tt*b.y;
        if (t === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();

      // Arrowhead
      const t2 = 0.92;
      const px2 = (1-t2)*(1-t2)*a.x + 2*(1-t2)*t2*mx + t2*t2*b.x;
      const py2 = (1-t2)*(1-t2)*a.y + 2*(1-t2)*t2*my + t2*t2*b.y;
      const angle = Math.atan2(b.y - py2, b.x - px2);
      g.fillStyle(color, 0.85);
      g.fillTriangle(
        b.x + Math.cos(angle)*10, b.y + Math.sin(angle)*10,
        b.x + Math.cos(angle+2.5)*9, b.y + Math.sin(angle+2.5)*9,
        b.x + Math.cos(angle-2.5)*9, b.y + Math.sin(angle-2.5)*9,
      );

      // Glow dots along path
      [0.2,0.4,0.6,0.8].forEach(tt => {
        const px = (1-tt)*(1-tt)*a.x + 2*(1-tt)*tt*mx + tt*tt*b.x;
        const py = (1-tt)*(1-tt)*a.y + 2*(1-tt)*tt*my + tt*tt*b.y;
        g.fillStyle(color, 0.4); g.fillCircle(px, py, 3);
      });
    });
  }

  drawSquare(i, g) {
    const coord = this.pathCoords[i];
    if (!coord) return;
    const { x, y, w, h } = coord;

    const sp = SPECIAL_SPACES.find(s => s.space === i);
    const isStart = i === 0;
    const isEnd = i === NUM_SPACES - 1;

    let texKey;
    if (isStart)                         texKey = 'sq-start';
    else if (isEnd)                      texKey = 'sq-end';
    else if (sp?.type === 'forward')     texKey = 'sq-forward';
    else if (sp?.type === 'back')        texKey = 'sq-back';
    else if (sp?.type === 'stuck')       texKey = 'sq-stuck';
    else                                 texKey = `sq-${SPACE_COLORS[i % SPACE_COLORS.length]}`;

    const img = this.add.image(x, y, texKey).setDepth(2);
    this.squareImages.push(img);

    // Labels for start/end
    if (isStart) {
      this.add.text(x, y, 'START', {
        fontFamily: 'Fredoka One', fontSize: '9px', color: '#7744AA',
      }).setOrigin(0.5).setDepth(3);
    } else if (isEnd) {
      // Crown emoji handled in UI
    }
  }

  drawLandmarkBanners() {
    LANDMARKS.forEach(lm => {
      if (lm.space >= NUM_SPACES) return;
      const coord = this.pathCoords[lm.space];
      if (!coord) return;
      const { x, y } = coord;

      const isEnd = lm.space === NUM_SPACES - 1;
      if (isEnd) {
        // Crown badge
        this.add.text(x, y, '🌟', {
          fontFamily: 'Nunito', fontSize: '22px',
        }).setOrigin(0.5).setDepth(4);
        this.add.text(x, y + 32, lm.name, {
          fontFamily: 'Fredoka One', fontSize: '9px', color: '#FFD166',
          stroke: '#2D0060', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(4);
        return;
      }

      // Emoji above square
      this.add.text(x, y - 22, lm.emoji, {
        fontFamily: 'Nunito', fontSize: '14px',
      }).setOrigin(0.5).setDepth(4);

      // Name tag pill to the side
      const lines = lm.name.split('\n');
      const tagW = 62, tagH = lines.length * 13 + 7;

      // Decide which side has more room
      const isRightSide = coord.col < 6;
      const tagX = isRightSide ? x + 38 : x - 38;
      const tagY = y;

      const tg = this.add.graphics().setDepth(4);
      tg.fillStyle(lm.color, 0.92);
      tg.fillRoundedRect(tagX - tagW/2, tagY - tagH/2, tagW, tagH, 8);
      tg.lineStyle(1.5, 0xFFFFFF, 0.6);
      tg.strokeRoundedRect(tagX - tagW/2, tagY - tagH/2, tagW, tagH, 8);

      // Connector line
      tg.lineStyle(1.5, 0xFFFFFF, 0.4);
      tg.lineBetween(isRightSide ? x+23 : x-23, y, isRightSide ? tagX-tagW/2 : tagX+tagW/2, y);

      lines.forEach((line, li) => {
        this.add.text(tagX, tagY - (lines.length-1)*6.5 + li*13, line, {
          fontFamily: 'Nunito', fontSize: '9px', fontStyle: 'bold', color: '#FFFFFF',
        }).setOrigin(0.5).setDepth(5);
      });
    });
  }

  getSquareColor(i) {
    const sp = SPECIAL_SPACES.find(s => s.space === i);
    if (sp?.type === 'forward') return 0x2EC4B6;
    if (sp?.type === 'back')    return 0xEF476F;
    if (sp?.type === 'stuck')   return 0xFF8C42;
    return COLOR_HEX[SPACE_COLORS[i % SPACE_COLORS.length]] || 0xAAAAAA;
  }

  // ─── PIECES ───────────────────────────────────────────────────────────────
  createPieces() {
    this.players.forEach((player, i) => {
      const coord = this.pathCoords[0];
      const offsets = [[-8,-6],[8,-6],[-8,6],[8,6]];
      const [ox, oy] = offsets[i] || [0,0];

      const shadow = this.add.graphics().setDepth(8);
      shadow.fillStyle(0x000000, 0.18);
      shadow.fillEllipse(coord.x + ox, coord.y + oy + 20, 26, 8);

      const sprite = this.add.image(coord.x + ox, coord.y + oy, `piece-${player.colorIndex}`)
        .setScale(1.05).setDepth(10 + i);

      player.pieceSprite = sprite;
      player.shadow = shadow;
      player.offsetX = ox;
      player.offsetY = oy;
    });
  }

  createParticleSystems() {
    this.sparkleEmitter = this.add.particles(0, 0, 'particle-sparkle', {
      speed: { min: 70, max: 190 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 14,
      emitting: false,
      tint: [0xFF6EB4, 0x9B6FE8, 0xFFD166, 0x2EC4B6, 0xFFFFFF],
    }).setDepth(50);

    this.trailEmitter = this.add.particles(0, 0, 'particle-sparkle', {
      speed: { min: 10, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.55, end: 0 },
      lifespan: 380,
      quantity: 2,
      frequency: 55,
      emitting: false,
      tint: [0xFFD166, 0xFFFFFF, 0xFF6EB4],
    }).setDepth(48);
  }

  // ─── TURN LOGIC ───────────────────────────────────────────────────────────
  startTurn() {
    if (this.gameOver) return;
    const player = this.players[this.currentPlayer];

    this.game.events.emit('turnStart', {
      player,
      playerIndex: this.currentPlayer,
      canDraw: player.stuckTurns === 0 && !player.isBot,
    });

    if (player.stuckTurns > 0) {
      player.stuckTurns--;
      this.time.delayedCall(800, () => {
        this.game.events.emit('log', `${player.name} is stuck! ${player.stuckTurns} turn(s) remaining.`);
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

    this.time.delayedCall(700, () => this.processCard(card, player));
  }

  processCard(card, player) {
    let targetPos = player.pos;
    let logMsg = '';

    if (card.type === 'location') {
      targetPos = card.space;
      logMsg = `${player.name} flies to ${card.emoji} ${card.name}!`;
    } else if (card.type === 'double') {
      targetPos = this.findColorSpace(player.pos, card.color, 2);
      logMsg = `${player.name} draws DOUBLE ${card.color}! Big move!`;
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
    const spr = this.squareImages[sp.space];
    if (spr) {
      this.tweens.add({
        targets: spr, scaleX: 1.4, scaleY: 1.4,
        duration: 180, yoyo: true, repeat: 2,
      });
    }

    if (sp.type === 'stuck') {
      player.stuckTurns = sp.turns;
      this.cameras.main.shake(400, 0.007);
      this.time.delayedCall(1500, () => this.checkWin(player));
    } else {
      this.time.delayedCall(900, () => {
        this.movePlayer(player, sp.target, () => this.checkWin(player));
      });
    }
  }

  checkWin(player) {
    if (player.pos >= NUM_SPACES - 1) {
      player.pos = NUM_SPACES - 1;
      this.gameOver = true;
      this.game.events.emit('log', `🌟 ${player.name} reached the Purple Crystal Crown!`);
      const coord = this.pathCoords[NUM_SPACES - 1];
      this.sparkleEmitter.setPosition(coord.x, coord.y);
      this.sparkleEmitter.explode(50);
      this.cameras.main.flash(500, 180, 80, 255);
      this.time.delayedCall(1200, () => {
        this.scene.start('Win', { winner: player });
        this.scene.stop('UI');
      });
      return;
    }
    this.animating = false;
    this.game.events.emit('updateScores', this.players);
    this.time.delayedCall(350, () => this.endTurn());
  }

  endTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    const p = this.players[this.currentPlayer];
    this.game.events.emit('turnStart', {
      player: p,
      playerIndex: this.currentPlayer,
      canDraw: p.stuckTurns === 0 && !p.isBot,
    });
    this.time.delayedCall(250, () => this.startTurn());
  }

  // ─── MOVEMENT ─────────────────────────────────────────────────────────────
  movePlayer(player, targetPos, onComplete) {
    if (targetPos === player.pos) { onComplete(); return; }
    const dir = targetPos > player.pos ? 1 : -1;
    const steps = [];
    let cur = player.pos;
    while (cur !== targetPos) { cur += dir; steps.push(cur); }
    this.animateSteps(player, steps, 0, onComplete);
  }

  animateSteps(player, steps, idx, onComplete) {
    if (idx >= steps.length) {
      this.sparkleEmitter.setPosition(player.pieceSprite.x, player.pieceSprite.y);
      this.sparkleEmitter.explode(18);
      this.cameras.main.shake(120, 0.003);
      onComplete();
      return;
    }

    const nextSpace = steps[idx];
    const coord = this.pathCoords[nextSpace];
    const targetX = coord.x + player.offsetX;
    const targetY = coord.y + player.offsetY;

    this.trailEmitter.setPosition(player.pieceSprite.x, player.pieceSprite.y);
    this.trailEmitter.start();

    const speed = Math.max(130, 240 - steps.length * 6);
    const jumpH = -20;

    this.tweens.add({
      targets: player.pieceSprite, x: targetX,
      duration: speed, ease: 'Linear',
    });
    this.tweens.add({
      targets: player.pieceSprite,
      y: targetY + jumpH,
      duration: speed / 2, ease: 'Sine.out',
      onComplete: () => {
        this.tweens.add({
          targets: player.pieceSprite,
          y: targetY,
          duration: speed / 2, ease: 'Bounce.out',
          onComplete: () => {
            // Update shadow
            player.shadow.clear();
            player.shadow.fillStyle(0x000000, 0.18);
            player.shadow.fillEllipse(targetX, targetY + 20, 26, 8);

            player.pos = nextSpace;

            this.tweens.add({
              targets: player.pieceSprite,
              scaleX: 1.18, scaleY: 0.88,
              duration: 55, yoyo: true,
            });

            this.trailEmitter.stop();
            const delay = idx < steps.length - 1 ? 18 : 50;
            this.time.delayedCall(delay, () => {
              this.animateSteps(player, steps, idx + 1, onComplete);
            });
          }
        });
      }
    });
  }
}
