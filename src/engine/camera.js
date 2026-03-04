import theme from '../config/theme.json';

const WORLD_WIDTH = theme.world?.width ?? 800;
const WORLD_HEIGHT = theme.world?.height ?? 2400;
const LERP_FACTOR = theme.camera?.lerpFactor ?? 0.08;
const VERTICAL_OFFSET_RATIO = theme.camera?.verticalOffsetRatio ?? 0.3;
const SKY_HEADROOM = 300;

export function createCamera() {
  return { x: 0, y: -SKY_HEADROOM };
}

// viewportWidth/viewportHeight are in world units (visible world size)
export function updateCamera(camera, targetX, targetY, viewportWidth, viewportHeight) {
  camera.x = 0;

  const targetCamY = targetY - viewportHeight * VERTICAL_OFFSET_RATIO;
  camera.y += (targetCamY - camera.y) * LERP_FACTOR;

  const maxY = Math.max(0, WORLD_HEIGHT - viewportHeight);
  camera.y = Math.max(-SKY_HEADROOM, Math.min(camera.y, maxY));

  return camera;
}
