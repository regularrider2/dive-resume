export function isNearby(playerX, playerY, itemX, itemY, radius) {
  const dx = itemX - playerX;
  const dy = itemY - playerY;
  return Math.sqrt(dx * dx + dy * dy) < radius;
}

export function findNearestInteractable(playerX, playerY, items, radius) {
  let nearest = null;
  let minDist = radius;

  for (const item of items) {
    if (!item.enabled) continue;
    const dx = item.x - playerX;
    const dy = item.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = item;
    }
  }

  return nearest;
}
