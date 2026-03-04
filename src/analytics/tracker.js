import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function initTracker(sessionId, ref) {
  if (!url || !anonKey || !url.startsWith('http')) return { client: null, sessionId, ref };
  try {
    return { client: createClient(url, anonKey), sessionId, ref };
  } catch {
    return { client: null, sessionId, ref };
  }
}

export function trackEvent(tracker, eventType, data = {}) {
  if (!tracker?.client) return;
  const row = {
    session_id: tracker.sessionId,
    ref: tracker.ref,
    event_type: eventType,
    data: { ...data },
  };
  tracker.client.from('events').insert(row).then(() => {}).catch(() => {});
}

export function trackSessionStart(tracker, metadata = {}) {
  trackEvent(tracker, 'session_start', {
    userAgent: metadata.userAgent ?? navigator?.userAgent,
    viewport: metadata.viewport ?? `${window?.innerWidth}x${window?.innerHeight}`,
    isTouchDevice: metadata.isTouchDevice ?? ('ontouchstart' in window),
  });
}

export function trackDiveStarted(tracker) {
  trackEvent(tracker, 'dive_started');
}

export function trackZoneEntered(tracker, zone) {
  trackEvent(tracker, 'zone_entered', { zone });
}

export function trackItemDiscovered(tracker, itemId, itemType, zone) {
  trackEvent(tracker, 'item_discovered', { itemId, itemType, zone });
}

export function trackCompletion(tracker, totalTime) {
  trackEvent(tracker, 'completion', { totalTime });
}

export function trackCtaClicked(tracker, linkType) {
  trackEvent(tracker, 'cta_clicked', { linkType });
}

export function trackLobsterDelivered(tracker, count) {
  trackEvent(tracker, 'lobster_delivered', { count });
}

export function trackConnectOpened(tracker) {
  trackEvent(tracker, 'connect_opened');
}

export function trackNpcChatOpened(tracker) {
  trackEvent(tracker, 'npc_chat_opened');
}

const MAX_CHAT_LOG_LENGTH = 2000;

function truncateForLog(s) {
  const str = typeof s === 'string' ? s : (s != null ? String(s) : '');
  return str.length > MAX_CHAT_LOG_LENGTH ? str.slice(0, MAX_CHAT_LOG_LENGTH) + '…' : str;
}

export function trackGhostDiverChat(tracker, question, answer) {
  if (!tracker?.client) return;
  trackEvent(tracker, 'ghost_diver_chat', {
    question: truncateForLog(question),
    answer: truncateForLog(answer),
  });
}
