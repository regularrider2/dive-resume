import theme from '../config/theme.json';

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export const touchState = {
  active: false,
  dx: 0,
  dy: 0,
  interactPressed: false,
};

const JOYSTICK_SIZE = theme.joystick?.size ?? 120;

let centerX = 0;
let centerY = 0;
let canvasRef = null;
let boundTouchStart;
let boundTouchMove;
let boundTouchEnd;

function handleTouchStart(e) {
  const touch = e.touches[0];
  if (!touch) return;
  const x = touch.clientX;
  const y = touch.clientY;
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;
  const relX = (x - rect.left) / canvasWidth;
  const relY = (y - rect.top) / canvasHeight;
  if (relX > 0.5 && relY > 0.5) {
    centerX = x;
    centerY = y;
    touchState.active = true;
    touchState.dx = 0;
    touchState.dy = 0;
  } else {
    touchState.interactPressed = true;
  }
}

function handleTouchMove(e) {
  if (!touchState.active) return;
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;
  const dx = touch.clientX - centerX;
  const dy = touch.clientY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = JOYSTICK_SIZE / 2;
  if (dist > maxDist) {
    const scale = maxDist / dist;
    touchState.dx = (dx * scale) / maxDist;
    touchState.dy = (dy * scale) / maxDist;
  } else {
    touchState.dx = dx / maxDist;
    touchState.dy = dy / maxDist;
  }
}

function handleTouchEnd(e) {
  if (e.touches.length === 0) {
    touchState.active = false;
    touchState.dx = 0;
    touchState.dy = 0;
  }
}

export function initTouchInput(canvas) {
  canvasRef = canvas;
  boundTouchStart = handleTouchStart;
  boundTouchMove = handleTouchMove;
  boundTouchEnd = handleTouchEnd;
  canvas.addEventListener('touchstart', boundTouchStart, { passive: true });
  canvas.addEventListener('touchmove', boundTouchMove, { passive: false });
  canvas.addEventListener('touchend', boundTouchEnd);
  canvas.addEventListener('touchcancel', boundTouchEnd);
}

export function clearTouchMovement() {
  touchState.active = false;
  touchState.dx = 0;
  touchState.dy = 0;
}

export function destroyTouchInput() {
  if (canvasRef) {
    canvasRef.removeEventListener('touchstart', boundTouchStart);
    canvasRef.removeEventListener('touchmove', boundTouchMove);
    canvasRef.removeEventListener('touchend', boundTouchEnd);
    canvasRef.removeEventListener('touchcancel', boundTouchEnd);
    canvasRef = null;
  }
  touchState.active = false;
  touchState.dx = 0;
  touchState.dy = 0;
  touchState.interactPressed = false;
}

export function consumeTouchInteract() {
  if (touchState.interactPressed) {
    touchState.interactPressed = false;
    return true;
  }
  return false;
}
