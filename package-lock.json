// ═══════════════════════════════════════════
// BOARD CONSTANTS
// ═══════════════════════════════════════════

export const BOARD_W = 1024;
export const BOARD_H = 768;

export const NUM_SPACES = 72; // Total path spaces including start/end

// Color sequence for spaces
export const SPACE_COLORS = ['pink','purple','teal','orange','yellow','blue'];

export const COLOR_HEX = {
  pink:   0xFF6EB4,
  purple: 0x9B6FE8,
  teal:   0x2EC4B6,
  orange: 0xFF8C42,
  yellow: 0xFFD166,
  blue:   0x4ECDC4,
};

export const COLOR_HEX_STR = {
  pink:   '#FF6EB4',
  purple: '#9B6FE8',
  teal:   '#2EC4B6',
  orange: '#FF8C42',
  yellow: '#FFD166',
  blue:   '#4ECDC4',
};

export const COLOR_EMOJI = {
  pink:   '🩷',
  purple: '💜',
  teal:   '💚',
  orange: '🧡',
  yellow: '💛',
  blue:   '💙',
};

export const COLOR_NAMES = {
  pink:   'Pink',
  purple: 'Purple',
  teal:   'Teal',
  orange: 'Orange',
  yellow: 'Yellow',
  blue:   'Blue',
};

// ═══════════════════════════════════════════
// PLAYER CONFIG
// ═══════════════════════════════════════════

export const PLAYER_COLORS = [0xFF6EB4, 0x9B6FE8, 0x2EC4B6, 0xFF8C42];
export const PLAYER_COLORS_STR = ['#FF6EB4', '#9B6FE8', '#2EC4B6', '#FF8C42'];
export const PLAYER_EMOJIS = ['⭐', '🌙', '🌺', '🎯'];
export const PLAYER_NAMES_DEFAULT = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

// ═══════════════════════════════════════════
// LANDMARKS (special named locations on board)
// ═══════════════════════════════════════════

export const LANDMARKS = [
  { space: 0,          name: 'Start',               emoji: '🏁', color: 0xCCCCCC, colorStr: '#CCCCCC' },
  { space: 5,          name: 'Fairy Garden',         emoji: '🧚', color: 0xFF6EB4, colorStr: '#FF6EB4' },
  { space: 18,         name: 'Unicorn Valley',       emoji: '🦄', color: 0x9B6FE8, colorStr: '#9B6FE8' },
  { space: 28,         name: "K-Pop Stage",          emoji: '🎤', color: 0xB44FFF, colorStr: '#B44FFF' },
  { space: 38,         name: 'Mermaid Lagoon',       emoji: '🧜‍♀️', color: 0x2EC4B6, colorStr: '#2EC4B6' },
  { space: 50,         name: 'Superhero HQ',         emoji: '🦸‍♀️', color: 0xFF8C42, colorStr: '#FF8C42' },
  { space: 58,         name: 'Flower Forest',        emoji: '🌸', color: 0xFF6EB4, colorStr: '#FF6EB4' },
  { space: 65,         name: 'Princess Palace',      emoji: '👑', color: 0xFFD166, colorStr: '#FFD166' },
  { space: NUM_SPACES-1, name: 'Purple Crystal Crown', emoji: '🌟', color: 0x9B6FE8, colorStr: '#9B6FE8' },
];

// ═══════════════════════════════════════════
// SPECIAL SPACES
// ═══════════════════════════════════════════

export const SPECIAL_SPACES = [
  { space: 8,  type: 'forward', target: 18, emoji: '🦄', label: 'Unicorn Express!',   desc: 'Hop on! A unicorn gallops you to Unicorn Valley!' },
  { space: 15, type: 'stuck',   turns: 1,   emoji: '🌀', label: 'Lost in the Garden!',desc: 'You spun in circles in the Fairy Garden. Skip 1 turn!' },
  { space: 22, type: 'back',    target: 10, emoji: '😬', label: 'Wrong Path!',         desc: 'Oops! The trail loops back. Go back to space 10!' },
  { space: 32, type: 'forward', target: 42, emoji: '🎤', label: 'K-Pop Shortcut!',    desc: 'Roomie, Mira & Zoey cheer you all the way forward!' },
  { space: 36, type: 'stuck',   turns: 2,   emoji: '🌊', label: 'Lost in the Lagoon!',desc: 'You got swept away in Mermaid Lagoon! Skip 2 turns!' },
  { space: 44, type: 'back',    target: 30, emoji: '🤸‍♀️', label: 'Tumbled Backwards!',  desc: 'A gymnastics flip sent you flying back!' },
  { space: 55, type: 'forward', target: 63, emoji: '🌸', label: 'Flower Power!',       desc: 'The enchanted flowers lift you to Princess Palace!' },
  { space: 60, type: 'stuck',   turns: 1,   emoji: '✨', label: 'Glitter Explosion!',  desc: 'Covered in craft glitter! Skip 1 turn.' },
  { space: 62, type: 'back',    target: 50, emoji: '👑', label: 'Royal Detour!',       desc: 'The royal guards sent you back to Superhero HQ!' },
];

// ═══════════════════════════════════════════
// CARDS
// ═══════════════════════════════════════════

export function buildDeck() {
  const deck = [];

  // Single color cards — 9 each = 54 total
  for (const color of SPACE_COLORS) {
    for (let i = 0; i < 9; i++) {
      deck.push({ type: 'single', color, double: false });
    }
  }

  // Double color cards — 3 each = 18 total
  for (const color of SPACE_COLORS) {
    for (let i = 0; i < 3; i++) {
      deck.push({ type: 'double', color, double: true });
    }
  }

  // Location cards — 1 each (rare ~8%)
  const locationCards = [
    { space: 5,  name: 'Fairy Garden',    emoji: '🧚', colorStr: '#FF6EB4' },
    { space: 18, name: 'Unicorn Valley',  emoji: '🦄', colorStr: '#9B6FE8' },
    { space: 28, name: 'K-Pop Stage',     emoji: '🎤', colorStr: '#B44FFF' },
    { space: 38, name: 'Mermaid Lagoon',  emoji: '🧜‍♀️', colorStr: '#2EC4B6' },
    { space: 50, name: 'Superhero HQ',    emoji: '🦸‍♀️', colorStr: '#FF8C42' },
    { space: 65, name: 'Princess Palace', emoji: '👑', colorStr: '#FFD166' },
  ];
  for (const loc of locationCards) {
    deck.push({ type: 'location', ...loc });
  }

  return shuffle(deck);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════
// BOARD PATH GEOMETRY
// Snake pattern — 9 spaces per row, 8 rows
// ═══════════════════════════════════════════

const PATH_COLS = 9;
const PATH_ROWS = 8;
const CELL_W = 62;
const CELL_H = 62;
const BOARD_OFFSET_X = 20;
const BOARD_OFFSET_Y = 20;

export function getSpacePosition(index) {
  const row = Math.floor(index / PATH_COLS);
  const col = index % PATH_COLS;
  const flipped = row % 2 === 1;
  const actualCol = flipped ? (PATH_COLS - 1 - col) : col;
  const x = BOARD_OFFSET_X + actualCol * CELL_W + CELL_W / 2;
  const y = BOARD_OFFSET_Y + (PATH_ROWS - 1 - row) * CELL_H + CELL_H / 2;
  return { x, y };
}

export function getSpaceColor(index) {
  if (index === 0 || index === NUM_SPACES - 1) return null;
  return SPACE_COLORS[index % SPACE_COLORS.length];
}
