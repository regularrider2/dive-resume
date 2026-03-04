import themeVis from '../config/theme.json';
import content from '../config/content.json';

const WORLD_HEIGHT = themeVis.world?.height ?? 2400;
const MAX_DEPTH_FEET = 120;

export function drawHUD(ctx, viewportWidth, viewportHeight, state, pixelSize, isMobile = false) {
  const p = pixelSize ?? themeVis.pixelSize;
  const ui = themeVis.colors.ui;

  // === DISCOVERED COUNTER (top-left) ===
  const fontSize = Math.max(isMobile ? 12 : 14, p * 7);
  const pillH = fontSize + 14;
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'left';
  let discText = `Discovered: ${state.discoveredItems?.size ?? 0} / ${state.totalItems ?? 0}`;
  let discW = ctx.measureText(discText).width + 20;
  const maxDiscW = isMobile ? Math.floor(viewportWidth * 0.42) : Infinity;
  if (discW > maxDiscW && maxDiscW < Infinity) {
    discText = `${state.discoveredItems?.size ?? 0}/${state.totalItems ?? 0}`;
    discW = Math.min(ctx.measureText(discText).width + 20, maxDiscW);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(8, 8, discW, pillH, 6);
  ctx.fill();
  ctx.fillStyle = ui.text;
  ctx.textBaseline = 'middle';
  ctx.fillText(discText, 18, 8 + pillH / 2);
  ctx.textBaseline = 'alphabetic';

  // === LOBSTER COUNTER (below discovery counter) ===
  if (state.lobsterTotal > 0) {
    const lobText = `🦞 ${state.lobstersCollected ?? 0} / ${state.lobsterTotal}`;
    const lobW = ctx.measureText(lobText).width + 20;
    const lobY = 8 + pillH + 6;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(8, lobY, lobW, pillH, 6);
    ctx.fill();
    ctx.fillStyle = state.carryingLobster ? '#FFD700' : ui.text;
    ctx.textBaseline = 'middle';
    ctx.fillText(lobText, 18, lobY + pillH / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // === ZONE LABEL (top-center desktop; top-right mobile, smaller) ===
  const zone = content.zones?.find(z => z.id === state.currentZone);
  const zoneLabel = zone?.label ?? state.currentZone ?? '';
  const zoneFontSize = isMobile ? 11 : Math.max(16, p * 8);
  const flavorFontSize = isMobile ? 9 : Math.max(11, p * 5);
  ctx.textAlign = 'center';

  const anno = state.zoneAnnouncement;
  const hasAnno = !!(anno && !state.airTimerActive);
  const slideT = hasAnno ? (anno.slideT ?? 1) : 1;   // 0=hidden above, 1=in view
  const expandT = hasAnno ? (anno.expandT ?? 0) : 0; // 0=label-only, 1=with flavor

  // Measure both rows (mobile: cap pill to top-right corner)
  ctx.font = `bold ${zoneFontSize}px monospace`;
  let displayZoneLabel = zoneLabel;
  let zoneLabelW = ctx.measureText(zoneLabel).width;

  const flavor = anno?.flavor ?? zone?.flavor ?? null;
  let displayFlavor = flavor ?? null;
  let flavorW = 0;
  if (flavor) {
    ctx.font = `italic ${flavorFontSize}px monospace`;
    flavorW = ctx.measureText(flavor).width;
  }

  const depthAreaW = isMobile ? 88 : 0; // space for depth ticker + label on right
  const maxPillW = isMobile ? Math.min(Math.floor(viewportWidth * 0.36), Math.max(80, viewportWidth - depthAreaW - 16)) : Infinity;
  const padding = isMobile ? 16 : 32;
  let pillW = Math.max(zoneLabelW, flavorW) + padding;
  if (isMobile && pillW > maxPillW) {
    pillW = maxPillW;
    // Truncate zone label with ellipsis to fit
    const maxLabelW = maxPillW - padding;
    if (zoneLabelW > maxLabelW) {
      for (let n = zoneLabel.length; n > 0; n--) {
        displayZoneLabel = zoneLabel.slice(0, n) + '…';
        if (ctx.measureText(displayZoneLabel).width <= maxLabelW) break;
      }
      zoneLabelW = ctx.measureText(displayZoneLabel).width;
    }
    if (flavor && flavorW > maxLabelW) {
      for (let n = flavor.length; n > 0; n--) {
        displayFlavor = flavor.slice(0, n) + '…';
        if (ctx.measureText(displayFlavor).width <= maxLabelW) break;
      }
    }
  }

  // Pill dimensions — height grows with expandT
  const collapsedH = zoneFontSize + (isMobile ? 10 : 16);
  const expandedH  = collapsedH + (flavorFontSize + (isMobile ? 6 : 10)) * (flavor ? 1 : 0);
  const zonePillH = collapsedH + (expandedH - collapsedH) * expandT;

  // Slide: pill slides to targetY. Mobile: top-right, compact.
  const targetY = 10;
  const pillY = targetY - (1 - slideT) * (collapsedH + 12);
  // On mobile, keep zone pill left of depth ticker (depth uses rightmost 88px)
  const pillX = isMobile ? Math.max(8, viewportWidth - depthAreaW - pillW - 8) : viewportWidth / 2 - pillW / 2;

  ctx.save();
  // Clip so pill can't draw above the canvas top during slide-in
  ctx.beginPath();
  ctx.rect(0, 0, viewportWidth, viewportHeight);
  ctx.clip();

  // Shadow/glow behind pill
  if (hasAnno && expandT > 0.05) {
    ctx.save();
    ctx.globalAlpha = expandT * 0.35;
    ctx.shadowColor = 'rgba(56,189,248,0.9)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(10,60,120,0.01)';
    ctx.beginPath();
    ctx.roundRect(pillX - 4, pillY - 4, pillW + 8, zonePillH + 8, 10);
    ctx.fill();
    ctx.restore();
  }

  // Pill background
  ctx.fillStyle = expandT > 0.05 ? 'rgba(0,18,48,0.90)' : 'rgba(0,0,0,0.60)';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, zonePillH, 8);
  ctx.fill();

  // Glowing border during announcement
  if (hasAnno && expandT > 0.05) {
    ctx.strokeStyle = `rgba(56,189,248,${0.55 * expandT})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, zonePillH, 8);
    ctx.stroke();
  }

  // Zone label (center of pill)
  const zoneTextX = pillX + pillW / 2;
  const labelTopPad = isMobile ? 6 : 8;
  const labelGap = isMobile ? 4 : 6;
  ctx.font = `bold ${zoneFontSize}px monospace`;
  ctx.fillStyle = ui.title;
  ctx.textBaseline = 'top';
  ctx.fillText(displayZoneLabel, zoneTextX, pillY + labelTopPad);

  // Flavor subtitle — fades in with expandT
  if (flavor && expandT > 0.05) {
    ctx.globalAlpha = expandT;
    ctx.font = `italic ${flavorFontSize}px monospace`;
    ctx.fillStyle = 'rgba(160,210,255,0.92)';
    ctx.fillText(displayFlavor ?? flavor, zoneTextX, pillY + labelTopPad + zoneFontSize + labelGap);
  }

  ctx.textBaseline = 'alphabetic';
  ctx.restore();

  // === DEPTH TICKER (right side) ===
  const depthRatio = Math.min(1, Math.max(0, state.playerY / WORLD_HEIGHT));
  const depthFeet = Math.round(depthRatio * MAX_DEPTH_FEET);

  const tickerW = Math.max(10, p * 6);
  const tickerH = Math.round(viewportHeight * 0.6);
  const tickerTop = Math.round((viewportHeight - tickerH) / 2);
  const labelGap = isMobile ? 44 : 60; // leave room for depth label + zone pill on narrow screens
  const tickerX = viewportWidth - tickerW - labelGap;

  // Background panel
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(tickerX - 4, tickerTop - 4, tickerW + 8, tickerH + 8, 6);
  ctx.fill();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, tickerTop, 0, tickerTop + tickerH);
  grad.addColorStop(0, '#3cb8e0');
  grad.addColorStop(0.3, '#1a8aad');
  grad.addColorStop(0.6, '#0e6b8a');
  grad.addColorStop(0.8, '#073f5c');
  grad.addColorStop(1, '#031b2e');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(tickerX, tickerTop, tickerW, tickerH, 4);
  ctx.fill();

  // Tick marks and labels
  const tickFontSize = Math.max(11, p * 5);
  ctx.font = `${tickFontSize}px monospace`;
  ctx.textAlign = 'right';
  const tickMarks = [0, 30, 60, 90, 120];
  for (const ft of tickMarks) {
    const yPos = tickerTop + (ft / MAX_DEPTH_FEET) * tickerH;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(tickerX - 4, yPos, tickerW + 4, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`${ft}ft`, tickerX - 7, yPos + tickFontSize * 0.4);
  }

  // Marker triangle (pointing right, on the left side of the bar)
  const markerY = tickerTop + depthRatio * tickerH;
  const triSize = Math.max(8, p * 4);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(tickerX - 2, markerY);
  ctx.lineTo(tickerX - 2 - triSize * 1.5, markerY - triSize);
  ctx.lineTo(tickerX - 2 - triSize * 1.5, markerY + triSize);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#aa8800';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Depth label INLINE with the triangle (to the left of it)
  const labelFontSize = Math.max(13, p * 6);
  ctx.font = `bold ${labelFontSize}px monospace`;
  ctx.textAlign = 'right';
  const labelText = `${depthFeet}ft`;
  const labelW = ctx.measureText(labelText).width + 12;
  const labelX = tickerX - 2 - triSize * 1.5 - 4;
  const labelY = markerY - labelFontSize / 2 - 4;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.roundRect(labelX - labelW, labelY, labelW, labelFontSize + 8, 4);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.fillText(labelText, labelX - 3, labelY + labelFontSize + 1);

  // "DEPTH" label below bar
  const depthLabelSize = Math.max(10, p * 4);
  ctx.font = `${depthLabelSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('DEPTH', tickerX + tickerW / 2, tickerTop + tickerH + depthLabelSize + 6);

  // === AIR TIMER ALERT (lobster carrying) ===
  if (state.airTimerActive && state.airTimer > 0) {
    const t = state.airTimer;
    const isLow = t <= 10;
    const isCritical = t <= 5;

    // Flash effect when critical — blink every ~500ms using real time
    const blink = isCritical ? Math.sin(Date.now() * 0.012) > 0 : true;

    if (blink) {
      const alertFontSize = Math.max(22, p * 11);
      const subFontSize = Math.max(13, p * 6);
      const label = `AIR: ${t}s`;
      const sub = t <= 10 ? '⬆ GET TO THE SURFACE!' : '⬆ Get that lobster to the boat!';

      ctx.font = `bold ${alertFontSize}px monospace`;
      const labelW = ctx.measureText(label).width;
      ctx.font = `bold ${subFontSize}px monospace`;
      const subW = ctx.measureText(sub).width;
      const boxW = Math.max(labelW, subW) + 32;
      const boxH = alertFontSize + subFontSize + 20;
      const boxX = viewportWidth / 2 - boxW / 2;
      const boxY = viewportHeight - boxH - 24;

      // Background
      const bgColor = isCritical ? 'rgba(180,20,20,0.88)' : isLow ? 'rgba(160,80,0,0.88)' : 'rgba(0,0,0,0.72)';
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();

      // Border
      const borderColor = isCritical ? '#ff4444' : isLow ? '#ffaa00' : '#ffdd00';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isCritical ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.stroke();

      // Main timer text
      ctx.font = `bold ${alertFontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isCritical ? '#ff6666' : '#FFD700';
      ctx.fillText(label, viewportWidth / 2, boxY + 8);

      // Sub label
      ctx.font = `bold ${subFontSize}px monospace`;
      ctx.fillStyle = isCritical ? '#ffaaaa' : '#ffeeaa';
      ctx.fillText(sub, viewportWidth / 2, boxY + 8 + alertFontSize + 4);
    }
  }


}
