import theme from '../config/theme.json';

const WORLD_WIDTH = theme.world?.width ?? 800;

export function createGameState(content) {
  const items = getEnabledItems(content);
  const totalItems = items.length;

  const lobsterCount = (content.lobsters ?? []).filter(l => l.enabled).length;

  return {
    screen: 'ready',
    currentZone: 'surface',
    previousZone: null,
    discoveredItems: new Set(),
    totalItems,
    playerX: WORLD_WIDTH * 0.5,
    playerY: -10,
    hasReachedDeep: false,
    carryingLobster: null,
    lobstersCollected: new Set(),
    lobsterTotal: lobsterCount,
    decompressionTriggered: false,
    decompressionActive: false,
    decompressionTimer: 12,
    decompressionWarning: false,
    decompressionWarningTimer: 3,
    showDialog: null,
    showCarousel: false,
    zoneAnnouncement: null,
    nearbyItem: null,
    sessionId: crypto.randomUUID(),
    ref: new URLSearchParams(window.location.search).get('ref'),
    audioUnlocked: false,
    startTime: null,
  };
}

export function discoverItem(state, itemId) {
  const next = new Set(state.discoveredItems);
  next.add(itemId);
  return { ...state, discoveredItems: next };
}

export function isComplete(state) {
  return state.discoveredItems.size >= state.totalItems &&
    state.lobstersCollected.size >= state.lobsterTotal;
}

export function getCurrentZone(playerY, zones) {
  const zonesList = zones ?? theme.zones ?? [];
  for (const zone of zonesList) {
    if (playerY >= zone.startY && playerY < zone.endY) {
      return zone.id;
    }
  }
  if (playerY < (zonesList[0]?.startY ?? 0)) return zonesList[0]?.id ?? 'surface';
  return zonesList[zonesList.length - 1]?.id ?? 'surface';
}

export function getEnabledItems(content) {
  const result = [];
  const worldWidth = theme.world?.width ?? 800;

  if (content.treasures) {
    for (const t of content.treasures) {
      if (t.enabled) {
        result.push({
          id: t.id, x: t.x * worldWidth, y: t.y,
          type: 'treasure', enabled: true, discovered: false,
        });
      }
    }
  }

  if (content.delhi?.enabled) {
    result.push({
      id: 'delhi', x: content.delhi.x * worldWidth, y: content.delhi.y,
      type: 'delhi', enabled: true, discovered: false,
    });
  }

  if (content.camera?.enabled) {
    result.push({
      id: 'camera', x: content.camera.x * worldWidth, y: content.camera.y,
      type: 'camera', enabled: true, discovered: false,
    });
  }

  return result;
}

export function getLobsterItems(content) {
  const worldWidth = theme.world?.width ?? 800;
  const result = [];
  if (content.lobsters) {
    for (const l of content.lobsters) {
      if (l.enabled) {
        result.push({
          id: l.id, x: l.x * worldWidth, y: l.y,
          type: 'lobster', enabled: true,
        });
      }
    }
  }
  return result;
}
