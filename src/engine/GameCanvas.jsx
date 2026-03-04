import React, { useRef, useEffect, useCallback } from 'react';
import theme from '../config/theme.json';
import content from '../config/content.json';
import { keys, consumeInteract, consumeEscape, initInput, destroyInput, clearMovementKeys } from './input.js';
import { touchState, consumeTouchInteract, initTouchInput, destroyTouchInput, isTouchDevice } from './touchInput.js';
import { createCamera, updateCamera } from './camera.js';
import { findNearestInteractable } from './collision.js';
import { getCurrentZone, getEnabledItems, getLobsterItems } from '../state/gameState.js';
import { drawBackground } from '../rendering/scenery.js';
import { drawDiver } from '../rendering/diver.js';
import { drawTreasure } from '../rendering/treasures.js';
import { drawFish, drawTurtle, drawShark, drawJellyfish, drawMantaRay, getSharkMouthHitbox } from '../rendering/creatures.js';
import { drawLobster } from '../rendering/lobster.js';
import { drawDelhi } from '../rendering/delhi.js';
import { drawNPCDiver } from '../rendering/npcDiver.js';
import { drawHUD } from '../rendering/hud.js';
import { drawScreenFlash } from '../rendering/effects.js';

const WORLD_WIDTH = theme.world?.width ?? 800;
const WORLD_HEIGHT = theme.world?.height ?? 2400;
const INTERACTION_RADIUS = theme.interactionRadius ?? 60;
const DIVER_SPEED = theme.diver?.speed ?? 3;
const SWIM_SOUND_INTERVAL = 400;

function getPixelSize() {
  const base = theme.pixelSize ?? 3;
  if (typeof window !== 'undefined' && window.innerWidth < 500) return Math.max(1, base - 1);
  return base;
}

function initCreatures() {
  const creatures = [];
  const zones = theme.zones ?? [];
  const creatureDefs = content.creatures ?? [];
  const worldW = WORLD_WIDTH;

  for (const def of creatureDefs) {
    const zone = zones.find(z => z.id === def.zone);
    if (!zone) continue;

    for (let i = 0; i < def.count; i++) {
      const yRange = zone.endY - zone.startY;
      const baseY = zone.startY + Math.random() * yRange;

      if (def.type === 'fish') {
        const colors = theme.creatures?.fish?.colors ?? ['#ff8844'];
        const sizes = theme.creatures?.fish?.sizes ?? [5];
        const speeds = theme.creatures?.fish?.speed ?? [1];
        const ci = i % colors.length;
        creatures.push({
          type: 'fish', x: Math.random() * worldW, y: baseY,
          color: colors[ci], colorIndex: ci,
          size: sizes[i % sizes.length],
          speed: speeds[i % speeds.length],
          direction: Math.random() > 0.5 ? 1 : -1, zone: def.zone,
        });
      } else if (def.type === 'turtle') {
        creatures.push({
          type: 'turtle', x: Math.random() * worldW, y: baseY,
          speed: theme.creatures?.turtle?.speed ?? 0.3, direction: 1,
          phase: Math.random() * Math.PI * 2, zone: def.zone,
        });
      } else if (def.type === 'shark') {
        creatures.push({
          type: 'shark', x: -100, y: baseY,
          speed: theme.creatures?.shark?.speed ?? 0.4, direction: 1, zone: def.zone,
        });
      } else if (def.type === 'jellyfish') {
        creatures.push({
          type: 'jellyfish', x: Math.random() * worldW, y: baseY,
          speed: theme.creatures?.jellyfish?.speed ?? 0.15,
          phase: Math.random() * Math.PI * 2, zone: def.zone,
          driftDir: Math.random() > 0.5 ? 1 : -1,
        });
      } else if (def.type === 'mantaRay') {
        creatures.push({
          type: 'mantaRay', x: -150, y: baseY,
          speed: theme.creatures?.mantaRay?.speed ?? 0.25, direction: 1,
          phase: Math.random() * Math.PI * 2, zone: def.zone,
        });
      }
    }
  }
  return creatures;
}

function updateCreatures(creatures, dt, viewW) {
  // Use the larger of WORLD_WIDTH and the current viewport so creatures
  // always cross the full visible area regardless of window size.
  const W = Math.max(WORLD_WIDTH, viewW ?? WORLD_WIDTH);
  for (const c of creatures) {
    if (c.type === 'fish') {
      c.x += c.speed * c.direction * dt;
      if (c.x > W + 30) { c.x = -30; c.direction = 1; }
      if (c.x < -30)    { c.x = W + 30; c.direction = -1; }
    } else if (c.type === 'turtle') {
      c.phase += 0.008 * dt;
      c.x += c.speed * c.direction * dt;
      c.y += Math.sin(c.phase) * 0.15 * dt;
      if (c.x > W + 50) { c.x = -50; c.direction = 1; }
      if (c.x < -50)    { c.x = W + 50; c.direction = -1; }
    } else if (c.type === 'shark') {
      c.x += c.speed * c.direction * dt;
      if (c.x > W + 150) c.direction = -1;
      if (c.x < -150)    c.direction = 1;
    } else if (c.type === 'jellyfish') {
      c.phase += 0.02 * dt;
      c.x += c.driftDir * c.speed * 0.3 * dt;
      c.y += Math.sin(c.phase * 0.5) * 0.1 * dt;
      if (c.x > W + 40) c.x = -40;
      if (c.x < -40)    c.x = W + 40;
    } else if (c.type === 'mantaRay') {
      c.phase += 0.015 * dt;
      c.x += c.speed * c.direction * dt;
      c.y += Math.sin(c.phase) * 0.08 * dt;
      if (c.x > W + 200) c.direction = -1;
      if (c.x < -200)    c.direction = 1;
    }
  }
}

function drawBreathBubbles(ctx, playerX, playerScreenY, direction, p, timestamp) {
  const s = p * 3.2;
  // Regulator world position (matches diver.js regulator arc)
  const cx = playerX - 16 * p + 16 * p; // = playerX (center x)
  const cy = playerScreenY - 8 * p + 8 * p; // = playerScreenY (center y)
  const regLocalX = s * 3.8;
  const regLocalY = s * 0.7;
  const rx = cx + (direction === -1 ? -regLocalX : regLocalX);
  const ry = cy + regLocalY;

  // Each bubble: offset in time so they stagger naturally
  // They rise upward with a slight horizontal wobble
  const BUBBLES = [
    { offset: 0,    size: 0.45, speed: 0.022 },
    { offset: 600,  size: 0.32, speed: 0.026 },
    { offset: 1100, size: 0.38, speed: 0.02  },
    { offset: 300,  size: 0.28, speed: 0.03  },
    { offset: 850,  size: 0.42, speed: 0.024 },
  ];

  const CYCLE = 1800; // ms for a bubble to travel from mouth to off-screen top

  ctx.save();
  for (const b of BUBBLES) {
    const t = ((timestamp + b.offset) % CYCLE) / CYCLE; // 0→1
    // Start at regulator, rise upward
    const bx = rx + Math.sin(t * Math.PI * 3 + b.offset) * p * 4;
    const by = ry - t * p * 60; // rise ~60px worth
    const radius = b.size * p * (1 + t * 0.6); // grow slightly as they rise
    const alpha = t < 0.1
      ? t / 0.1           // fade in near mouth
      : t > 0.75
        ? (1 - t) / 0.25  // fade out near top
        : 1;

    ctx.globalAlpha = alpha * 0.7;
    // Bubble fill — translucent white-blue
    ctx.fillStyle = 'rgba(200, 235, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.fill();
    // Bubble rim
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.8)';
    ctx.lineWidth = Math.max(0.5, p * 0.2);
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.stroke();
    // Tiny glare dot
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.arc(bx - radius * 0.3, by - radius * 0.3, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSharkBubble(ctx, x, y, p) {
  const text = '🦈 Oh look, a shark!';
  const fontSize = Math.max(13, p * 6);
  const padX = 12;
  const padY = 8;

  ctx.font = `bold ${fontSize}px monospace`;
  const tw = ctx.measureText(text).width;
  const bw = tw + padX * 2;
  const bh = fontSize + padY * 2;
  const bx = x - bw / 2;
  const by = y - bh;

  // Bubble tail points down toward diver head
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.beginPath();
  ctx.moveTo(x - 7, by + bh);
  ctx.lineTo(x, by + bh + 10);
  ctx.lineTo(x + 7, by + bh);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.fill();

  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.stroke();

  ctx.fillStyle = '#cc2222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, by + bh / 2);
}

function drawBoatBubble(ctx, x, y, p) {
  const line1 = 'Dive! Dive! Dive!';
  const line2 = 'Use arrow keys to move';
  const fontSize = Math.max(14, p * 6.5);
  const subFontSize = Math.max(10, p * 4.8);
  const lineGap = 6;
  const padX = 14;
  const padY = 10;

  ctx.font = `bold ${fontSize}px monospace`;
  const tw1 = ctx.measureText(line1).width;
  ctx.font = `${subFontSize}px monospace`;
  const tw2 = ctx.measureText(line2).width;

  const bw = Math.max(tw1, tw2) + padX * 2;
  const bh = fontSize + lineGap + subFontSize + padY * 2;
  const bx = x - bw / 2;
  const by = y - bh;

  // Tail pointing down-left toward the captain's megaphone
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.beginPath();
  ctx.moveTo(bx + 10, by + bh);
  ctx.lineTo(bx - 10, by + bh + 16);
  ctx.lineTo(bx + 26, by + bh);
  ctx.closePath();
  ctx.fill();

  // Bubble body
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();

  // Border — deep navy blue to feel nautical
  ctx.strokeStyle = '#1a4080';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Line 1 — bold main text
  ctx.fillStyle = '#1a3060';
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillText(line1, x, by + padY + fontSize / 2);

  // Line 2 — smaller hint
  ctx.fillStyle = '#4a6090';
  ctx.font = `${subFontSize}px monospace`;
  ctx.fillText(line2, x, by + padY + fontSize + lineGap + subFontSize / 2);
}

function drawLabelBubble(ctx, x, y, text, p, subtext) {
  const fontSize = Math.max(13, p * 6);
  const subFontSize = subtext ? Math.max(10, p * 4.5) : 0;
  const padX = 10;
  const padY = 6;
  const lineGap = subtext ? 4 : 0;

  ctx.font = `bold ${fontSize}px monospace`;
  const mainWidth = ctx.measureText(text).width;
  let maxWidth = mainWidth;
  if (subtext) {
    ctx.font = `${subFontSize}px monospace`;
    maxWidth = Math.max(mainWidth, ctx.measureText(subtext).width);
  }

  const bw = maxWidth + padX * 2;
  const bh = fontSize + (subtext ? subFontSize + lineGap : 0) + padY * 2;
  const bx = x - bw / 2;
  const by = y - bh;

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(x - 6, by + bh);
  ctx.lineTo(x, by + bh + 8);
  ctx.lineTo(x + 6, by + bh);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = theme.colors.ui.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.stroke();

  ctx.textAlign = 'center';
  if (subtext) {
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = '#222222';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + padY + fontSize / 2);
    ctx.font = `${subFontSize}px monospace`;
    ctx.fillStyle = '#555555';
    ctx.fillText(subtext, x, by + padY + fontSize + lineGap + subFontSize / 2);
  } else {
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = '#222222';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + bh / 2);
  }
}

const ITEM_LABELS = {
  'bottle':         { emoji: '📜', text: 'Why Hire Me' },
  'echo-show':      { emoji: '📺', text: 'Alexa Smart Home Growth' },
  'ring-doorbell':  { emoji: '📷', text: 'Alexa Cameras' },
  'blueprint':      { emoji: '🏠', text: 'Alexa Map View' },
  'treasure-chest': { emoji: '💰', text: 'The Deal Expert' },
  'amazon':         { emoji: '📦', text: 'Amazon Retail' },
  'lio':           { emoji: '🧭', text: 'Centric Brands' },
  'penn':          { emoji: '🎓', text: 'Education' },
};

// Vertical offsets so label bubbles sit above each sprite
const ITEM_Y_OFFSET = {
  'bottle':         3,
  'echo-show':      3,
  'ring-doorbell':  4,
  'blueprint':      3,
  'treasure-chest': 3,
  'amazon':         3,
  'ships-wheel':    3,
  'lio':           3,
  'compass':        3,
  'penn':           3,
};

function drawCameraSprite(ctx, x, y, glowPhase, p) {
  const cam = theme.dslrCamera ?? {};
  const bodyW = 20 * p, bodyH = 14 * p;
  const bx = x - bodyW / 2, by = y - bodyH / 2;

  if (glowPhase > 0) {
    const glowR = 18 * p + glowPhase * 4 * p;
    ctx.save();
    ctx.globalAlpha = glowPhase * 0.3;
    ctx.fillStyle = cam.glowColor ?? '#FFDD44';
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = cam.bodyColor ?? '#222222';
  ctx.fillRect(bx, by, bodyW, bodyH);
  ctx.fillStyle = cam.bodyLight ?? '#333333';
  ctx.fillRect(bx + 2 * p, by, bodyW - 4 * p, 3 * p);

  const lensR = 4 * p;
  ctx.fillStyle = cam.lensDark ?? '#222222';
  ctx.beginPath();
  ctx.arc(x + 2 * p, y, lensR + p, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cam.lensColor ?? '#444444';
  ctx.beginPath();
  ctx.arc(x + 2 * p, y, lensR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cam.lensRing ?? '#888888';
  ctx.beginPath();
  ctx.arc(x + 2 * p, y, lensR - 2 * p, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = cam.flashColor ?? '#CCCCCC';
  ctx.fillRect(bx + 3 * p, by - 3 * p, 4 * p, 3 * p);

  ctx.fillStyle = cam.gripColor ?? '#1a1a1a';
  ctx.fillRect(bx + bodyW - 4 * p, by + 2 * p, 4 * p, bodyH - 4 * p);
}

// NPC Diver — fixed position in The Reef zone
const NPC_DIVER_X = Math.round((theme.world?.width ?? 800) * 0.28);
const NPC_DIVER_Y = Math.round((57 / 130) * (theme.world?.height ?? 2000)); // 57 ft depth

const NPC_QUIPS = [
  '👻 I know his whole career. Ask me anything.',
  '👻 I\'ve been down here a while. Come say hi.',
];

const NPC_EXHAUSTED_QUIPS = [
  '👻 Out of tokens. David\'s broke.',
  '👻 GPT-4 isn\'t free, you know.',
  '👻 My lips are sealed. And rate-limited.',
  '👻 Budget: $0.00. Questions: closed.',
];


export default function GameCanvas({
  gameState, onDiscover, onOpenDialog, onCloseDialog, onZoneChange,
  onDecompression, onUpdateDecompression, onUpdatePlayer, onPlayEffect, onUpdateNearby,
  onPickupLobster, onGameOver, onOpenNPCChat, npcChatOpen, npcExhausted, npcChatted,
}) {
  const canvasRef = useRef(null);
  const cameraRef = useRef(createCamera());
  const creaturesRef = useRef(null);
  const flashRef = useRef(0);
  const lastTimeRef = useRef(0);
  const swimTimerRef = useRef(0);
  const directionRef = useRef(1);
  const animFrameRef = useRef(0);
  const animTimerRef = useRef(0);
  const rafRef = useRef(null);
  const sharkBubbleRef = useRef(0); // countdown ms for "Oh look a shark!" bubble
  const wasInDeepRef = useRef(false); // true when player was in deep last frame (for transition detection)
  const npcWasNearbyRef = useRef(false); // tracks whether player was already in NPC radius
  const boatBubbleRef = useRef(0); // countdown ms for "Dive, dive, dive!" boat bubble
  const prevIsReadyRef = useRef(true); // to detect ready→playing transition
  const idleTimerRef = useRef(0); // ms since player last moved
  const postDialogBubbleRef = useRef(null); // { text, timer, total } shown after closing a dialog
  const prevDialogOpenRef = useRef(false); // tracks prior frame dialog state
  const lastOpenedItemIdRef = useRef(null); // id of item whose dialog was most recently opened
  const trenchBubbleRef = useRef(null); // { timer, total } when player first enters trench — "Look, a lobster!"
  const trenchBubbleShownRef = useRef(false); // true while in trench after showing once; reset when leaving

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  if (!creaturesRef.current) creaturesRef.current = initCreatures();

  const gameLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const p = getPixelSize();

    // Clear to a solid background so sky/water never show stale or undrawn bands
    ctx.fillStyle = '#1a3060';
    ctx.fillRect(0, 0, w, h);

    const dt = lastTimeRef.current ? Math.min((timestamp - lastTimeRef.current) / 16, 3) : 1;
    lastTimeRef.current = timestamp;

    animTimerRef.current += dt * 16;
    if (animTimerRef.current > 300) {
      animTimerRef.current = 0;
      animFrameRef.current = animFrameRef.current === 0 ? 1 : 0;
    }

    const isReady = state.screen === 'ready';
    let nearestAny = null; // populated in the movement block, used in rendering

    // Detect title → playing transition and fire boat bubble
    if (prevIsReadyRef.current && !isReady) {
      boatBubbleRef.current = 4000; // show for 4 seconds
    }
    prevIsReadyRef.current = isReady;
    if (boatBubbleRef.current > 0) boatBubbleRef.current -= dt * 16;
    const dialogOpen = !!state.showDialog || state.showCarousel;
    // Wise Diver: same interaction radius as items; open when you run into him
    const npcDistNow = Math.sqrt((state.playerX - NPC_DIVER_X) ** 2 + (state.playerY - NPC_DIVER_Y) ** 2);
    const npcInRangeNow = npcDistNow < INTERACTION_RADIUS;
    const justEnteredNPCRange = npcInRangeNow && !npcWasNearbyRef.current && !dialogOpen && state.screen === 'playing';
    if (justEnteredNPCRange) {
      onOpenNPCChat?.();
    }
    if (state.screen === 'playing') npcWasNearbyRef.current = npcInRangeNow;
    const locked = dialogOpen || isReady || !!npcChatOpen || justEnteredNPCRange;

    if (!locked && state.screen === 'playing') {
      let dx = 0, dy = 0;
      if (keys.up) dy -= 1;
      if (keys.down) dy += 1;
      if (keys.left) dx -= 1;
      if (keys.right) dx += 1;

      if (touchState.active) {
        dx = touchState.dx;
        dy = touchState.dy;
      }

      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        let normDx = dx / mag;
        let normDy = dy / mag;
        // Resist upward movement during decompression warning — slow ascent to ~20% while warning is active
        if (state.decompressionWarning && normDy < 0) {
          normDy *= 0.2;
        }
        const speed = DIVER_SPEED * Math.min(mag, 1) * dt * (keys.shift ? 1.5 : 1);
        const newX = Math.max(20, Math.min(WORLD_WIDTH - 20, state.playerX + normDx * speed));
        const newY = Math.max(10, Math.min(WORLD_HEIGHT - 50, state.playerY + normDy * speed));
        if (normDx !== 0) directionRef.current = normDx > 0 ? 1 : -1;
        onUpdatePlayer(newX, newY);
        idleTimerRef.current = 0; // reset idle on movement

        swimTimerRef.current += dt * 16;
        if (swimTimerRef.current > SWIM_SOUND_INTERVAL) {
          swimTimerRef.current = 0;
          onPlayEffect('swim');
        }
      } else {
        idleTimerRef.current += dt * 16;
      }

      const zone = getCurrentZone(state.playerY, theme.zones);
      if (zone !== state.currentZone) onZoneChange(zone);

      const DECOMP_DEEP_Y   = (WORLD_HEIGHT / 120) * 30; // 30 ft threshold
      const DECOMP_STOP_Y   = (WORLD_HEIGHT / 120) * 20; // 20 ft safety-stop zone

      // Mark that the diver has been deep enough to require a stop on ascent
      if (state.playerY >= DECOMP_DEEP_Y && !state.hasReachedDeep) {
        onDecompression('reachedDeep');
      }
      // Trigger safety stop when ascending through 20 ft (after being below 30 ft)
      if (state.hasReachedDeep && !state.decompressionTriggered && state.playerY <= DECOMP_STOP_Y) {
        onDecompression('trigger');
      }
      // If they dive back below 30 ft mid-stop, cancel the stop entirely and reset the cycle
      if (state.decompressionActive && state.playerY >= DECOMP_DEEP_Y) {
        onDecompression('cancelAndReset');
      }

      const items = getEnabledItems(content).map(item => ({
        ...item, discovered: state.discoveredItems.has(item.id),
      }));

      const availableLobsters = !state.carryingLobster
        ? getLobsterItems(content).filter(l => !state.lobstersCollected.has(l.id))
        : [];
      const allInteractables = [...items, ...availableLobsters];

      const nearest = findNearestInteractable(state.playerX, state.playerY, allInteractables.filter(it => !it.discovered && !state.lobstersCollected.has(it.id)), INTERACTION_RADIUS);
      nearestAny = findNearestInteractable(state.playerX, state.playerY, allInteractables, INTERACTION_RADIUS);
      onUpdateNearby(nearest || nearestAny);

      const spacePressed = consumeInteract();
      const tapPressed = consumeTouchInteract();

      // Ghost Diver chat opens when you swim into him (handled above via justEnteredNPCRange); no space/tap needed

      // Auto-open undiscovered items on proximity
      if (nearest) {
        const target = nearest;
        if (target.type === 'lobster') {
          if (!state.carryingLobster && !state.lobstersCollected.has(target.id)) {
            onPickupLobster(target.id);
            flashRef.current = 0.25;
          }
        } else {
          let dialogData = null;
          if (target.type === 'treasure') {
            dialogData = { type: 'treasure', id: target.id, data: content.treasures.find(tr => tr.id === target.id) };
          } else if (target.type === 'delhi') {
            dialogData = { type: 'delhi', id: 'delhi', data: content.delhi };
          } else if (target.type === 'camera') {
            dialogData = { type: 'camera', id: 'camera', data: content.camera };
          }
          if (dialogData) {
            lastOpenedItemIdRef.current = target.id;
            onOpenDialog(dialogData);
            if (!state.discoveredItems.has(target.id)) {
              onDiscover(target.id, target.type, state.currentZone);
              flashRef.current = 0.25;
            }
          }
        }
      }

      // Re-open already-discovered items via SPACE or tap
      if (!nearest && nearestAny && (spacePressed || tapPressed) && !dialogOpen) {
        const target = nearestAny;
        if (target.type === 'treasure' && state.discoveredItems.has(target.id)) {
          lastOpenedItemIdRef.current = target.id;
          onOpenDialog({ type: 'treasure', id: target.id, data: content.treasures.find(tr => tr.id === target.id) });
        } else if (target.type === 'delhi') {
          lastOpenedItemIdRef.current = target.id;
          onOpenDialog({ type: 'delhi', id: 'delhi', data: content.delhi });
        } else if (target.type === 'camera') {
          lastOpenedItemIdRef.current = target.id;
          onOpenDialog({ type: 'camera', id: 'camera', data: content.camera });
        }
      }

    }

    if (state.decompressionActive) {
      const DECOMP_STOP_Y = (WORLD_HEIGHT / 120) * 20;
      const tooShallow = state.playerY < DECOMP_STOP_Y - 30; // surfaced above the stop zone

      if (tooShallow) {
        if (!state.decompressionWarning) onDecompression('ascending');
      } else {
        if (state.decompressionWarning) onDecompression('returnedDown');
      }
    }

    if (consumeEscape() && !state.decompressionActive) {
      if (state.showDialog || state.showCarousel) onCloseDialog();
    }

    // Countdown post-dialog bubble
    if (postDialogBubbleRef.current) {
      postDialogBubbleRef.current.timer -= dt * 16;
      if (postDialogBubbleRef.current.timer <= 0) postDialogBubbleRef.current = null;
    }
    // Trigger trench-entry player bubble ("Look, a lobster!") — once per entry
    if (state.currentZone !== 'trench') trenchBubbleShownRef.current = false;
    if (state.currentZone === 'trench' && state.previousZone && state.previousZone !== 'trench' && !trenchBubbleShownRef.current) {
      trenchBubbleRef.current = { timer: 3500, total: 3500 };
      trenchBubbleShownRef.current = true;
    }
    if (trenchBubbleRef.current) {
      trenchBubbleRef.current.timer -= dt * 16;
      if (trenchBubbleRef.current.timer <= 0) trenchBubbleRef.current = null;
    }

    // Detect dialog open → close and fire post-dialog reaction bubble
    const ITEM_REACTIONS = {
      'bottle':         '🤿 Alright David, let\'s see what else is down here.',
      'echo-show':      '🤿 Alexa, turn off the lights',
      'ring-doorbell':  '🤿 "Alexa, let me know when you see a shark."',
      'blueprint':      '🤿 A digital floorplan. I could use one of those down here.',
      'treasure-chest': '🤿 Someone had to make sure the deals actually worked. Apparently it was him.',
      'amazon':         '🤿 Little Big Shoe Award. That\'s a real thing.',
      'lio':           '🤿 This guy has been automating workflows for a while.',
      'penn':          '🤿 Economics, not Wharton. But that explains the LTV models.',
    };
    if (prevDialogOpenRef.current && !dialogOpen && lastOpenedItemIdRef.current) {
      const closedId = lastOpenedItemIdRef.current;
      let reaction = null;
      if (closedId === 'delhi') {
        reaction = '🤿 Three legs and still the best boy.';
      } else if (closedId === 'camera') {
        reaction = '🤿 I wonder if the 👻 Ghost Diver knows what award he won?';
      } else {
        const treasureData = content.treasures?.find(t => t.id === closedId);
        const iconType = treasureData?.iconType;
        reaction = ITEM_REACTIONS[iconType];
      }
      if (reaction) {
        const total = 3500;
        postDialogBubbleRef.current = { text: reaction, timer: total, total };
      }
      lastOpenedItemIdRef.current = null;
    }
    prevDialogOpenRef.current = dialogOpen;

    updateCreatures(creaturesRef.current, dt, WORLD_WIDTH);

    // On mobile: zoom in slightly (smaller viewport in world units) so it doesn't feel zoomed out; desktop unchanged
    const isMobile = w < 768 || (typeof window !== 'undefined' && isTouchDevice());
    const viewportWidthWorld = isMobile ? WORLD_WIDTH * 0.38 : WORLD_WIDTH;
    const scale = w / viewportWidthWorld;
    const viewHeightWorld = h / scale;

    const camera = updateCamera(cameraRef.current, state.playerX, state.playerY, viewportWidthWorld, viewHeightWorld);
    if (isMobile) camera.x = (WORLD_WIDTH - viewportWidthWorld) / 2;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    ctx.scale(scale, scale);
    ctx.translate(-camera.x, -camera.y);

    drawBackground(ctx, camera.x, camera.y, viewportWidthWorld, viewHeightWorld, timestamp, p);

    const visibleTop = camera.y - 80;
    const visibleBottom = camera.y + viewHeightWorld + 80;

    // Trigger "Oh look, a shark!" when player first transitions into the Deep
    const currentZone = getCurrentZone(state.playerY, theme.zones);
    const inDeep = currentZone?.id === 'deep';
    if (inDeep && !wasInDeepRef.current) {
      sharkBubbleRef.current = 3000; // show for 3 seconds
    }
    wasInDeepRef.current = inDeep;

    for (const c of creaturesRef.current) {
      if (c.y < visibleTop || c.y > visibleBottom) continue;
      if (c.type === 'fish') {
        drawFish(ctx, c.x, c.y, c.color, c.size, c.direction, p, c.colorIndex);
      } else if (c.type === 'turtle') {
        drawTurtle(ctx, c.x, c.y, c.direction, animFrameRef.current, p);
      } else if (c.type === 'shark') {
        drawShark(ctx, c.x, c.y, c.direction, p);

        // Shark mouth hitbox — only when game is actively playing
        if (state.screen === 'playing') {
          const mb = getSharkMouthHitbox(c, p);
          const dx = state.playerX - mb.x;
          const dy = state.playerY - mb.y;
          if (Math.sqrt(dx * dx + dy * dy) < mb.r + p * 6) {
            onGameOver?.('sharkBite');
          }
        }
      } else if (c.type === 'jellyfish') {
        drawJellyfish(ctx, c.x, c.y, c.phase, p);
      } else if (c.type === 'mantaRay') {
        drawMantaRay(ctx, c.x, c.y, c.direction, c.phase, p);
      }
    }
    if (sharkBubbleRef.current > 0) sharkBubbleRef.current -= dt * 16;

    // Boat "Dive, dive, dive!" bubble (world coords)
    if (boatBubbleRef.current > 0) {
      const TOTAL_BOAT_BUBBLE = 4000;
      const remaining = boatBubbleRef.current;
      const fadeIn  = Math.min(1, (TOTAL_BOAT_BUBBLE - remaining) / 250);
      const fadeOut = Math.min(1, remaining / 600);
      const alpha   = Math.min(fadeIn, fadeOut);
      const surfaceStart = theme.zones?.find(z => z.id === 'surface')?.startY ?? 0;
      const boatWorldX = WORLD_WIDTH / 2;
      const s = p * 22;
      const bubbleWorldX = boatWorldX + s * 1.5 + s * 0.9;
      const bubbleWorldY = surfaceStart - s * 0.5 - s * 1.85;
      if (bubbleWorldY >= visibleTop && bubbleWorldY <= visibleBottom) {
        ctx.save();
        ctx.globalAlpha = alpha;
        drawBoatBubble(ctx, bubbleWorldX, bubbleWorldY, p);
        ctx.restore();
      }
    }

    if (!isReady) {
      const glowPhase = (timestamp % 2000) / 2000;
      const bobOffset = Math.sin(timestamp * 0.003) * 3;

      const items = getEnabledItems(content);
      for (const item of items) {
        if (item.y < visibleTop || item.y > visibleBottom) continue;
        const discovered = state.discoveredItems.has(item.id);
        const itemY = item.y + (discovered ? 0 : bobOffset);

        if (item.type === 'treasure') {
          const treasureData = content.treasures.find(t => t.id === item.id);
          const iconType = treasureData?.iconType ?? 'treasure-chest';
          drawTreasure(ctx, item.x, itemY, iconType, discovered, glowPhase, p, timestamp);
          if (discovered && nearestAny?.id === item.id) {
            const isTouchDev = typeof window !== 'undefined' && ('ontouchstart' in window);
            const yOff = (ITEM_Y_OFFSET[iconType] ?? 3) * p * 8;
            const lbl = ITEM_LABELS[iconType];
            const reviewLabel = lbl
              ? (isTouchDev ? `👆 Re-read: ${lbl.text}` : `[SPACE] Re-read: ${lbl.text}`)
              : (isTouchDev ? '👆 Re-read' : '[SPACE] Re-read');
            drawLabelBubble(ctx, item.x, itemY - yOff, reviewLabel, p);
          } else if (!discovered) {
            const lbl = ITEM_LABELS[iconType];
            const yOff = (ITEM_Y_OFFSET[iconType] ?? 3) * p * 8;
            if (lbl) {
              drawLabelBubble(ctx, item.x, itemY - yOff, `${lbl.emoji} ${lbl.text}`, p);
            }
          }
        } else if (item.type === 'camera') {
          ctx.save();
          ctx.globalAlpha = discovered ? 0.4 : 1;
          const camGlow = discovered ? 0 : glowPhase;
          drawCameraSprite(ctx, item.x, itemY, camGlow, p);
          if (discovered && nearestAny?.id === item.id) {
            const isTouchDev = typeof window !== 'undefined' && ('ontouchstart' in window);
            const reviewLabel = isTouchDev ? '👆 Re-read: Photo Gallery' : '[SPACE] Re-read: Photo Gallery';
            drawLabelBubble(ctx, item.x, itemY - 20 * p, reviewLabel, p);
          } else if (!discovered) {
            drawLabelBubble(ctx, item.x, itemY - 20 * p, '📷 Award Winning Photographer', p);
          }
          ctx.restore();
        } else if (item.type === 'delhi') {
          drawDelhi(ctx, item.x, itemY, discovered, animFrameRef.current, glowPhase, p);
          if (discovered && nearestAny?.id === item.id) {
            const isTouchDev = typeof window !== 'undefined' && ('ontouchstart' in window);
            const reviewLabel = isTouchDev ? '👆 Re-read: Delhi' : '[SPACE] Re-read: Delhi';
            drawLabelBubble(ctx, item.x, itemY - 22 * p, reviewLabel, p);
          } else if (!discovered) {
            drawLabelBubble(ctx, item.x, itemY - 22 * p, '🐕 Woof!', p);
          }
        }
      }

      const lobsterItems = getLobsterItems(content);
      for (const lob of lobsterItems) {
        if (lob.y < visibleTop || lob.y > visibleBottom) continue;
        if (state.lobstersCollected.has(lob.id)) continue;
        if (state.carryingLobster === lob.id) continue;
        const lobY = lob.y + bobOffset;
        drawLobster(ctx, lob.x, lobY, false, animFrameRef.current, glowPhase, p);
        drawLabelBubble(ctx, lob.x, lobY - 20 * p, '🦞 Bring me to the surface', p);
      }
    }

    // ── NPC Wise Diver ────────────────────────────────────────────────────────
    if (NPC_DIVER_Y >= visibleTop && NPC_DIVER_Y <= visibleBottom) {
      const npcBob = Math.sin(timestamp * 0.0018) * 5;
      const npcDxPlayer = state.playerX - NPC_DIVER_X;
      const npcDyPlayer = state.playerY - NPC_DIVER_Y;
      const npcDistPlayer = Math.sqrt(npcDxPlayer * npcDxPlayer + npcDyPlayer * npcDyPlayer);
      const npcNearby = npcDistPlayer < INTERACTION_RADIUS;

      const npcDir = state.playerX > NPC_DIVER_X ? 1 : -1;
      drawNPCDiver(ctx, NPC_DIVER_X - 28 * p, NPC_DIVER_Y - 14 * p, npcDir, npcBob, p);

      const npcQuipCycle = npcExhausted ? 4000 : 3200;
      const npcQuipList  = npcExhausted ? NPC_EXHAUSTED_QUIPS : NPC_QUIPS;
      const npcQuipIdx   = Math.floor(timestamp / npcQuipCycle) % npcQuipList.length;
      const npcQuipPhase = (timestamp % npcQuipCycle) / npcQuipCycle;
      const npcQuipAlpha = npcQuipPhase < 0.1 ? npcQuipPhase / 0.1
                         : npcQuipPhase > 0.85 ? (1 - npcQuipPhase) / 0.15
                         : 1;
      const npcQuip = npcQuipList[npcQuipIdx];
      const npcBubbleY = NPC_DIVER_Y - 14 * p - 20 * p + npcBob;
      ctx.save();
      ctx.globalAlpha = npcQuipAlpha * 0.9;
      drawLabelBubble(ctx, NPC_DIVER_X, npcBubbleY, npcQuip, p);
      ctx.restore();
    }

    drawDiver(ctx, state.playerX - 28 * p, state.playerY - 14 * p, directionRef.current, isReady ? 0 : animFrameRef.current, p);

    // Lobster drawn AFTER diver so it always renders in front
    if (state.carryingLobster) {
      const dir = directionRef.current;
      const lobX = state.playerX + dir * 38 * p;
      const lobY = state.playerY + 10 * p;
      drawLobster(ctx, lobX, lobY, false, animFrameRef.current, 0, p * 0.55, dir);

      // Zone-aware speech bubble — drawn above lobster, also in front of diver
      const LOBSTER_ZONE_LINES = {
        'trench':   '🦞 Up up up — butter awaits!',
        'deep':     '🦞 I accept my fate. Keep going.',
        'reef':     '🦞 I can smell the garlic from here.',
        'shallows': '🦞 Tell the chef I said hi.',
        'surface':  '🦞 ...at least I\'ll be delicious.',
      };
      const lobsterLine = LOBSTER_ZONE_LINES[state.currentZone] ?? '🦞 → Surface!';
      drawLabelBubble(ctx, lobX, lobY - 18 * p, lobsterLine, p * 0.85);
    }

    // Breath bubbles from regulator
    if (!isReady) {
      drawBreathBubbles(ctx, state.playerX, state.playerY, directionRef.current, p, timestamp);
    }

    // ── Player speech bubbles — strict priority, one at a time, never overlapping ──
    // Base anchor: just above the diver sprite top (diver is ~16p tall above playerY)
    if (!isReady) {
      const BUBBLE_FONT_SIZE = Math.max(13, p * 6);
      const BUBBLE_HEIGHT_APPROX = BUBBLE_FONT_SIZE + 12 + 8 + 14; // content + padding + tail
      const LOBSTER_LABEL_HEIGHT = state.carryingLobster ? (BUBBLE_FONT_SIZE + 28) : 0;
      const diverTop = state.playerY - 16 * p;
      // Clear the lobster label if present
      const baseY = diverTop - LOBSTER_LABEL_HEIGHT - 4;
      // Clamp so bubble never goes above top of screen with a small margin
      const bubbleY = Math.max(BUBBLE_HEIGHT_APPROX + 8, baseY);

      // Priority 1: shark bubble (highest urgency — suppresses everything else)
      if (sharkBubbleRef.current > 0) {
        const fadeIn  = Math.min(1, (3000 - sharkBubbleRef.current) / 200);
        const fadeOut = Math.min(1, sharkBubbleRef.current / 400);
        ctx.save();
        ctx.globalAlpha = Math.min(fadeIn, fadeOut);
        drawSharkBubble(ctx, state.playerX, bubbleY, p);
        ctx.restore();
      // Priority 2: post-dialog reaction (only when no shark bubble)
      } else if (postDialogBubbleRef.current && postDialogBubbleRef.current.timer > 0) {
        const { text, timer, total } = postDialogBubbleRef.current;
        const fadeIn  = Math.min(1, (total - timer) / 300);
        const fadeOut = Math.min(1, timer / 500);
        ctx.save();
        ctx.globalAlpha = Math.min(fadeIn, fadeOut);
        drawLabelBubble(ctx, state.playerX, bubbleY, text, p);
        ctx.restore();
      // Priority 2.5: trench entry — player says "Look, a lobster!"
      } else if (trenchBubbleRef.current && trenchBubbleRef.current.timer > 0) {
        const { timer, total } = trenchBubbleRef.current;
        const fadeIn  = Math.min(1, (total - timer) / 300);
        const fadeOut = Math.min(1, timer / 500);
        ctx.save();
        ctx.globalAlpha = Math.min(fadeIn, fadeOut);
        drawLabelBubble(ctx, state.playerX, bubbleY, '🤿 Look, a lobster!', p);
        ctx.restore();
      // Priority 3: context-aware idle nudge
      } else if (!dialogOpen) {
        const IDLE_DELAY_MS = 4000;
        const IDLE_SHOW_MS  = 3500;
        const cycleMs = IDLE_SHOW_MS + 1000;

        // Safety stop — player should be holding still, give them flavour text
        if (state.decompressionActive && state.decompressionWarning) {
          // Ascending too early — urgent single message, no rotation
          const WARN_MSGS = [
            '🤿 Too early! Get back down!',
            '🤿 Not yet — back to depth!',
            '🤿 Still decompressing! Go back!',
          ];
          const warnIdx = Math.floor(timestamp / 2500) % WARN_MSGS.length;
          const warnCycle = (timestamp % 2500) / 2500;
          const fadeIn  = Math.min(1, warnCycle / 0.12);
          const fadeOut = Math.min(1, (1 - warnCycle) / 0.12);
          ctx.save();
          ctx.globalAlpha = Math.min(fadeIn, fadeOut);
          drawLabelBubble(ctx, state.playerX, bubbleY, WARN_MSGS[warnIdx], p);
          ctx.restore();
        } else if (state.decompressionActive) {
          // Holding at the stop — calm, slightly restless rotating messages
          const DECOMP_NUDGES = [
            '🤿 Just… waiting.',
            '🤿 Counting bubbles.',
            '🤿 Nice fish.',
            '🤿 Is this how fish feel?',
            '🤿 Safety first, always.',
          ];
          if (idleTimerRef.current > 1500) {
            const cyclePos = (idleTimerRef.current - 1500) % cycleMs;
            if (cyclePos < IDLE_SHOW_MS) {
              const idx = Math.floor((idleTimerRef.current - 1500) / cycleMs) % DECOMP_NUDGES.length;
              const fadeIn  = Math.min(1, cyclePos / 300);
              const fadeOut = Math.min(1, (IDLE_SHOW_MS - cyclePos) / 400);
              ctx.save();
              ctx.globalAlpha = Math.min(fadeIn, fadeOut);
              drawLabelBubble(ctx, state.playerX, bubbleY, DECOMP_NUDGES[idx], p);
              ctx.restore();
            }
          }
        } else {
          // Normal exploration idle nudges
          const IDLE_NUDGES = [
            '🤿 Anything else down here?',
            '🤿 Might wanna swim around...',
            '🤿 Explore! There\'s more to find.',
            '🤿 Use arrow keys to move around!',
          ];
          if (idleTimerRef.current > IDLE_DELAY_MS) {
            const cyclePos = (idleTimerRef.current - IDLE_DELAY_MS) % cycleMs;
            if (cyclePos < IDLE_SHOW_MS) {
              const nudgeIdx = Math.floor((idleTimerRef.current - IDLE_DELAY_MS) / cycleMs) % IDLE_NUDGES.length;
              const fadeIn  = Math.min(1, cyclePos / 300);
              const fadeOut = Math.min(1, (IDLE_SHOW_MS - cyclePos) / 400);
              ctx.save();
              ctx.globalAlpha = Math.min(fadeIn, fadeOut);
              drawLabelBubble(ctx, state.playerX, bubbleY, IDLE_NUDGES[nudgeIdx], p, 'Use arrow keys to move');
              ctx.restore();
            }
          }
        }
      }
    }

    ctx.restore();

    if (flashRef.current > 0) {
      drawScreenFlash(ctx, w, h, flashRef.current);
      flashRef.current = Math.max(0, flashRef.current - 0.02);
    }

    if (!isReady) {
      drawHUD(ctx, w, h, {
        currentZone: state.currentZone,
        discoveredItems: state.discoveredItems,
        totalItems: state.totalItems,
        playerY: state.playerY,
        zoneAnnouncement: state.zoneAnnouncement,
        nearbyItem: state.nearbyItem,
        lobstersCollected: state.lobstersCollected?.size ?? 0,
        lobsterTotal: state.lobsterTotal ?? 0,
        carryingLobster: state.carryingLobster,
        airTimer: state.airTimer ?? 0,
        airTimerActive: state.airTimerActive ?? false,
      }, p, isMobile);
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [onDiscover, onOpenDialog, onCloseDialog, onZoneChange, onDecompression, onUpdateDecompression, onUpdatePlayer, onPlayEffect, onUpdateNearby, onPickupLobster, onOpenNPCChat, npcChatOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    initInput();
    if (isTouchDevice()) initTouchInput(canvas);
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('resize', resize);
      destroyInput(); destroyTouchInput();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop]);

  return (
    <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh', imageRendering: 'pixelated' }} />
  );
}
