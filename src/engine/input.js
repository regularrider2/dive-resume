const KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'interact',
  Enter: 'interact',
  Escape: 'escape',
};

export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  interact: false,
  escape: false,
  shift: false,
};

let interactPressed = false;
let escapePressed = false;

let boundKeyDown;
let boundKeyUp;

function handleKeyDown(e) {
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { keys.shift = true; return; }
  // Don't intercept keys when the user is typing in an input or textarea
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const key = KEY_MAP[e.code];
  if (!key) return;
  e.preventDefault();
  if (key === 'interact') {
    interactPressed = true;
  } else if (key === 'escape') {
    escapePressed = true;
  } else if (keys[key] === false) {
    keys[key] = true;
  }
}

function handleKeyUp(e) {
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { keys.shift = false; return; }
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const key = KEY_MAP[e.code];
  if (!key) return;
  e.preventDefault();
  if (key !== 'interact' && key !== 'escape') {
    keys[key] = false;
  }
}

export function initInput() {
  boundKeyDown = handleKeyDown;
  boundKeyUp = handleKeyUp;
  window.addEventListener('keydown', boundKeyDown);
  window.addEventListener('keyup', boundKeyUp);
}

export function clearMovementKeys() {
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
  keys.shift = false;
}

export function destroyInput() {
  window.removeEventListener('keydown', boundKeyDown);
  window.removeEventListener('keyup', boundKeyUp);
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
  keys.interact = false;
  keys.escape = false;
  keys.shift = false;
  interactPressed = false;
  escapePressed = false;
}

export function consumeInteract() {
  if (interactPressed) {
    interactPressed = false;
    return true;
  }
  return false;
}

export function consumeEscape() {
  if (escapePressed) {
    escapePressed = false;
    return true;
  }
  return false;
}

export function isMoving() {
  return keys.up || keys.down || keys.left || keys.right;
}
