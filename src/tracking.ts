const SESSION_ID_KEY = 'ripple-session-id';
const SESSION_START_KEY = 'ripple-session-start';
const CONSENT_KEY = 'ripple-analytics-consent';
const QUEUE_KEY = 'ripple-analytics-events';
const APP_VERSION = 'bn-onboarding-v1';
const ENDPOINT = (import.meta.env.VITE_TRACKING_ENDPOINT || '').trim();

type EventData = Record<string, string | number | boolean | string[] | number[] | null | undefined>;

function makeId(prefix: string) {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix + '-' + id;
}

function sessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = makeId('rbd');
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function sessionStartedAt() {
  let value = sessionStorage.getItem(SESSION_START_KEY);
  if (!value) {
    value = String(Date.now());
    sessionStorage.setItem(SESSION_START_KEY, value);
  }
  return Number(value);
}

function deviceClass() {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function saveLocal(payload: Record<string, unknown>) {
  try {
    const existing = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Record<string, unknown>[];
    existing.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(existing.slice(-150)));
  } catch {
    // Local analytics is a non-critical fallback.
  }
}

export function hasAnalyticsConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'yes';
}

export function setAnalyticsConsent(value: boolean) {
  localStorage.setItem(CONSENT_KEY, value ? 'yes' : 'no');
}

export function track(event: string, data: EventData = {}) {
  if (!hasAnalyticsConsent()) return;

  const now = Date.now();
  const payload = {
    event_id: makeId('evt'),
    event,
    timestamp: new Date(now).toISOString(),
    session_id: sessionId(),
    session_started_at: new Date(sessionStartedAt()).toISOString(),
    session_elapsed_ms: now - sessionStartedAt(),
    screen: data.screen ?? null,
    scenario_id: data.scenario_id ?? null,
    scenario_index: data.scenario_index ?? null,
    choice_id: data.choice_id ?? null,
    choice_kind: data.choice_kind ?? null,
    choice_score: data.choice_score ?? null,
    scenario_score: data.scenario_score ?? null,
    session_score: data.session_score ?? null,
    duration_ms: data.duration_ms ?? null,
    signals_count: data.signals_count ?? null,
    signals: data.signals ?? null,
    device_class: deviceClass(),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    language: navigator.language || 'bn',
    app_version: APP_VERSION,
    path: window.location.pathname
  };

  saveLocal(payload);

  if (!ENDPOINT) return;

  fetch(ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-store',
    keepalive: true,
    headers: {'Content-Type': 'text/plain;charset=UTF-8'},
    body: JSON.stringify(payload)
  }).catch(() => {
    // Local fallback already contains the event.
  });
}

export function localAnalyticsCount() {
  try {
    return (JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as unknown[]).length;
  } catch {
    return 0;
  }
}
