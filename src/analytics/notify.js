/**
 * Session notification — sends a summary webhook when a dive session ends.
 * Configure VITE_NOTIFY_WEBHOOK in .env to any webhook URL.
 *
 * Works with:
 *   ntfy.sh  — https://ntfy.sh/your-topic  (free, no account needed)
 *   Discord  — server > channel > integrations > webhook URL
 *   Slack    — incoming webhook app URL
 *   Make / Zapier / n8n — paste their webhook URL
 */

const WEBHOOK_URL = import.meta.env.VITE_NOTIFY_WEBHOOK;

// Accumulates stats over the lifetime of the session
const session = {
  startTime: Date.now(),
  diveStarted: false,
  diveStartTime: null,
  maxDepthFt: 0,
  zonesVisited: new Set(),
  itemsDiscovered: [],
  gotLobster: false,
  deliveredLobster: false,
  viewedResume: false,
  ctaClicks: [],       // { type, ts }
  gameOverReason: null,
  completed: false,
  notified: false,     // prevent double-fire
};

export function notifyDiveStarted() {
  session.diveStarted = true;
  session.diveStartTime = Date.now();
}

export function notifyDepth(depthFt) {
  if (depthFt > session.maxDepthFt) session.maxDepthFt = depthFt;
}

export function notifyZone(zone) {
  session.zonesVisited.add(zone);
}

export function notifyItemDiscovered(itemId, itemType, zone) {
  session.itemsDiscovered.push({ itemId, zone });
}

export function notifyLobsterPickup() {
  session.gotLobster = true;
}

export function notifyLobsterDelivered() {
  session.deliveredLobster = true;
}

export function notifyResumeViewed() {
  session.viewedResume = true;
}

export function notifyCtaClick(type) {
  session.ctaClicks.push({ type, ts: Date.now() });
  if (type === 'resume_view') session.viewedResume = true;
}

export function notifyGameOver(reason) {
  session.gameOverReason = reason;
  sendNotification('game_over');
}

export function notifyCompletion() {
  session.completed = true;
  sendNotification('completed');
}

// Call on page unload to catch abandoned sessions
export function notifyPageExit() {
  if (!session.diveStarted) return; // never even dived — skip
  sendNotification('abandoned');
}

function elapsedSince(ts) {
  if (!ts) return null;
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function buildMessage(trigger) {
  const diveDuration = elapsedSince(session.diveStartTime);
  const totalDuration = elapsedSince(session.startTime);
  const items = session.itemsDiscovered.length;
  const zones = [...session.zonesVisited].join(', ') || 'none';

  const outcome =
    trigger === 'completed'   ? '✅ COMPLETED THE DIVE' :
    trigger === 'game_over'   ? `💀 GAME OVER (${session.gameOverReason ?? 'unknown'})` :
                                '🚪 LEFT EARLY';

  const ctaSummary = session.ctaClicks.length
    ? session.ctaClicks.map(c => c.type).join(', ')
    : 'none';

  const lines = [
    `🤿 Deep Dive Resume — Session Report`,
    ``,
    `Outcome: ${outcome}`,
    ``,
    `📊 Stats`,
    `  Max depth:     ${session.maxDepthFt} ft`,
    `  Items found:   ${items}`,
    `  Zones visited: ${zones}`,
    `  Got lobster:   ${session.gotLobster ? 'Yes 🦞' : 'No'}`,
    `  Ate lobster:   ${session.deliveredLobster ? 'Yes 🍽️' : 'No'}`,
    ``,
    `🔗 Actions`,
    `  Viewed resume: ${session.viewedResume ? 'Yes 📄' : 'No'}`,
    `  CTAs clicked:  ${ctaSummary}`,
    ``,
    `⏱ Timing`,
    `  Dive time:     ${diveDuration ?? 'n/a'}`,
    `  Total on site: ${totalDuration ?? 'n/a'}`,
    ``,
    `🌐 ${navigator?.userAgent?.slice(0, 80) ?? 'unknown'}`,
  ];

  return lines.join('\n');
}

function isSelf() {
  try { return new URLSearchParams(window.location.search).get('ref') === 'self'; } catch { return false; }
}

function sendNotification(trigger) {
  if (!WEBHOOK_URL || session.notified || isSelf()) return;
  session.notified = true;

  const message = buildMessage(trigger);

  // Try to detect the webhook type and format accordingly
  let body, headers;

  if (WEBHOOK_URL.includes('discord.com/api/webhooks')) {
    // Discord
    body = JSON.stringify({ content: `\`\`\`\n${message}\n\`\`\`` });
    headers = { 'Content-Type': 'application/json' };
  } else if (WEBHOOK_URL.includes('hooks.slack.com')) {
    // Slack
    body = JSON.stringify({ text: `\`\`\`${message}\`\`\`` });
    headers = { 'Content-Type': 'application/json' };
  } else if (WEBHOOK_URL.startsWith('https://ntfy.sh/')) {
    // ntfy.sh — plain text body, title in header
    body = message;
    headers = {
      'Title': 'Deep Dive Resume Session',
      'Priority': trigger === 'completed' ? 'high' : 'default',
      'Tags': trigger === 'completed' ? 'trophy' : trigger === 'game_over' ? 'skull' : 'door',
    };
  } else {
    // Generic / Make / Zapier / n8n — send JSON
    body = JSON.stringify({
      trigger,
      outcome: trigger,
      gameOverReason: session.gameOverReason,
      maxDepthFt: session.maxDepthFt,
      itemsDiscovered: session.itemsDiscovered.length,
      zonesVisited: [...session.zonesVisited],
      gotLobster: session.gotLobster,
      deliveredLobster: session.deliveredLobster,
      viewedResume: session.viewedResume,
      ctaClicks: session.ctaClicks,
      diveDurationSec: session.diveStartTime ? Math.round((Date.now() - session.diveStartTime) / 1000) : null,
      totalDurationSec: Math.round((Date.now() - session.startTime) / 1000),
      userAgent: navigator?.userAgent,
      message,
    });
    headers = { 'Content-Type': 'application/json' };
  }

  // Use sendBeacon for page-exit reliability, fetch otherwise
  if (trigger === 'abandoned' && navigator.sendBeacon) {
    const blob = new Blob([body], { type: headers['Content-Type'] ?? 'text/plain' });
    navigator.sendBeacon(WEBHOOK_URL, blob);
  } else {
    fetch(WEBHOOK_URL, { method: 'POST', headers, body, keepalive: true })
      .catch(() => {}); // silent fail — never interrupt the user experience
  }
}
