function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || "{}");
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var events = payload.events || [];

    events.forEach(function (event) {
      var sheet = getOrCreateSheet_(spreadsheet, event.sheet);
      appendEvent_(sheet, event, payload.storeName || "Terra Relva");
    });

    logMessage_(spreadsheet, "ok", "Recebidos " + events.length + " eventos");

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, processed: events.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    logMessage_(spreadsheet, "erro", String(error));
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_(spreadsheet, name) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  return sheet;
}

function appendEvent_(sheet, event, storeName) {
  var payload = event.payload || {};
  var keys = Object.keys(payload);
  var header = ["store_name", "event_id", "created_at", "action"].concat(keys);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
  }

  ensureHeader_(sheet, header);

  var currentHeader = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = currentHeader.map(function (column) {
    if (column === "store_name") return storeName;
    if (column === "event_id") return event.id || "";
    if (column === "created_at") return event.createdAt || "";
    if (column === "action") return event.action || "";
    return payload[column] !== undefined ? payload[column] : "";
  });

  if (event.sheet === "Produtos" && event.action === "upsert_stock") {
    upsertProductStock_(sheet, currentHeader, row, payload);
    return;
  }

  sheet.appendRow(row);
}

function ensureHeader_(sheet, header) {
  var current = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var changed = false;

  header.forEach(function (column) {
    if (current.indexOf(column) === -1) {
      current.push(column);
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, current.length).setValues([current]);
  }
}

function upsertProductStock_(sheet, header, row, payload) {
  var codeIndex = header.indexOf("code");
  var stockIndex = header.indexOf("stock");
  if (codeIndex === -1 || stockIndex === -1) {
    sheet.appendRow(row);
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    sheet.appendRow(row);
    return;
  }

  var values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][codeIndex]) === String(payload.code)) {
      sheet.getRange(i + 2, stockIndex + 1).setValue(payload.stock);
      return;
    }
  }

  sheet.appendRow(row);
}

function logMessage_(spreadsheet, status, message) {
  var sheet = getOrCreateSheet_(spreadsheet, "Logs");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "status", "message"]);
  }
  sheet.appendRow([new Date(), status, message]);
}
