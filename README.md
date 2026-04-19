# ✨ Savanna's Magical World

A fully-featured Candyland-style board game built with the **Phaser 3** game engine.

## Features

- 🎮 Real game engine (Phaser 3) — not just canvas drawing
- 🌈 72-space winding board with snake path layout
- 🦄 10 magical themed locations
- ⚡ Special spaces: teleport forward, sent back, stuck turns
- 🃏 Full card deck: single color, double color, rare location cards
- 🏃 Smooth animated piece movement with arc jumps & trail effects
- ✨ Particle effects on landing and winning
- 🤖 Up to 3 bot players (auto-play)
- 🎊 Confetti win screen
- 📱 Scales to fit tablet/desktop/mobile

## Running Locally

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploy to Render

1. Push this folder to your GitHub repo
2. In Render, create a **Web Service**
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `node server.js`
5. Deploy!

## Game Rules

- Draw a card each turn
- **Color cards** → move to next space of that color
- **Double cards** → move to 2nd space of that color (bigger jump!)
- **Location cards** (rare, ~8%) → teleport to that named location
- **Special spaces**:
  - 🟢 Teal arrow spaces → jump forward to a location
  - 🔴 Red arrow spaces → sent back on the path
  - 🟠 Orange spaces → stuck, skip 1-2 turns
- First player to reach the **Purple Crystal Crown** wins! 👑🌟

## Players
- 1-4 players
- Mix of human and bot players
- Bot players auto-draw after a short delay
