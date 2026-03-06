import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const VISITOR_KEY = 'dive_visitor_id';

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

export function initTracker(sessionId, ref) {
  if (!url || !anonKey || !url.startsWith('http')) {
    if (isDev) {
      console.warn('[Analytics] Disabled: missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
    }
    return { client: null, sessionId, ref, visitorId: null };
  }
  try {
    const tracker = { client: createClient(url, anonKey), sessionId, ref, visitorId: getOrCreateVisitorId() };
    if (isDev && ref === 'self') {
      console.warn('[Analytics] Events skipped for this session (ref=self). Use a URL without ?ref=self to record metrics.');
    }
    return tracker;
  } catch (e) {
    if (isDev) console.warn('[Analytics] Supabase client failed:', e);
    return { client: null, sessionId, ref, visitorId: null };
  }
}

export function trackEvent(tracker, eventType, data = {}) {
  if (!tracker?.client || tracker.ref === 'self') {
    if (!import.meta.env.DEV && eventType === 'session_start' && !tracker?.client) {
      console.warn('[Analytics] Disabled — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set in this build');
    }
    return;
  }
  const row = {
    session_id: tracker.sessionId,
    ref: tracker.ref,
    event_type: eventType,
    data: { ...data },
  };
  tracker.client
    .from('events')
    .insert(row)
    .then(() => {
      if (isDev && eventType === 'session_start') {
        console.info('[Analytics] session_start sent to Supabase');
      }
    })
    .catch((err) => {
      const msg = err?.message ?? String(err);
      const details = err?.details ?? err?.hint ?? '';
      if (isDev) {
        console.warn('[Analytics] Insert failed:', eventType, msg, details || err);
      }
      if (!isDev && eventType === 'session_start') {
        console.warn('[Analytics] session_start failed:', msg, details || '');
      }
    });
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
