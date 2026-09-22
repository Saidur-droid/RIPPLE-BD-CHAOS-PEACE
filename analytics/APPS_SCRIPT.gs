const SHEET_NAME = 'events';
const HEADERS = [
  'timestamp',
  'event_id',
  'session_id',
  'event',
  'scenario_id',
  'scenario_index',
  'screen',
  'choice_id',
  'choice_kind',
  'choice_score',
  'scenario_score',
  'session_score',
  'duration_ms',
  'signals_count',
  'device_class',
  'viewport_width',
  'viewport_height',
  'language',
  'app_version',
  'session_elapsed_ms',
  'payload_json'
];

function safeCell(value) {
  if (value === null || value === undefined) return '';
  let text = Array.isArray(value) ? value.join('|') : String(value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text.slice(0, 1000);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const sheet = getSheet();
    const row = [
      payload.timestamp,
      payload.event_id,
      payload.session_id,
      payload.event,
      payload.scenario_id,
      payload.scenario_index,
      payload.screen,
      payload.choice_id,
      payload.choice_kind,
      payload.choice_score,
      payload.scenario_score,
      payload.session_score,
      payload.duration_ms,
      payload.signals_count,
      payload.device_class,
      payload.viewport_width,
      payload.viewport_height,
      payload.language,
      payload.app_version,
      payload.session_elapsed_ms,
      JSON.stringify(payload)
    ].map(safeCell);

    sheet.appendRow(row);
    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: String(error)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: 'RIPPLE BD anonymous event collector',
      sheet: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
