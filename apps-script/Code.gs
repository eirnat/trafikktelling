/**
 * Webapp for trafikktelling.
 * POST lagrer en telling. GET returnerer radene som JSON.
 * Øktnummer tildeles første gang en gyldig oktNokkel sees.
 */

var TILLATTE_STEDER = [
  "e16-laerdal-vest",
  "e16-laerdal-ost",
  "rv52-hemsedal-vest",
  "rv52-hemsedal-ost",
];

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registreringer") || ss.getSheets()[0];

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("Ingen data mottatt").setMimeType(
        ContentService.MimeType.TEXT
      );
    }

    var data = JSON.parse(e.postData.contents);
    var stedRaw = String(data.sted || "").trim();
    var sted = TILLATTE_STEDER.indexOf(stedRaw) >= 0 ? stedRaw : "";

    ensureColumns(sheet);
    var okt = resolveOkt(ss, String(data.oktNokkel || ""), sted);

    sheet.appendRow([
      new Date(),
      data.land || "Ukjent",
      data.trafikk || "Privat",
      data.type || "Personbil",
      data.lat != null ? data.lat : "",
      data.lng != null ? data.lng : "",
      sted,
      okt === "" ? "" : okt,
    ]);

    return ContentService.createTextOutput("Suksess").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.log("Feil i doPost: " + err.toString());
    return ContentService.createTextOutput("Feil: " + err.toString()).setMimeType(
      ContentService.MimeType.TEXT
    );
  }
}

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registreringer") || ss.getSheets()[0];
    ensureColumns(sheet);
    var rows = sheet.getDataRange().getValues();

    if (rows.length < 2) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(
        ContentService.MimeType.JSON
      );
    }

    var headers = rows[0];
    var data = rows.slice(1).map(function (row) {
      var obj = {};
      headers.forEach(function (header, i) {
        var key = header.toString().toLowerCase().trim().replace(/\s+/g, "");
        obj[key] = row[i];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    console.log("Feil i doGet: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

function ensureColumns(sheet) {
  var stedCell = sheet.getRange(1, 7);
  if (!String(stedCell.getValue() || "").trim()) {
    stedCell.setValue("sted");
  }
  var oktCell = sheet.getRange(1, 8);
  if (!String(oktCell.getValue() || "").trim()) {
    oktCell.setValue("okt");
  }
}

function isSessionKey(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function resolveOkt(ss, nokkel, sted) {
  var key = String(nokkel || "").trim().toLowerCase();
  if (!isSessionKey(key)) return "";

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = ss.getSheetByName("Økter");
    if (!sheet) {
      sheet = ss.insertSheet("Økter");
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["okt", "nokkel", "sted", "startet"]);
    }

    var last = sheet.getLastRow();
    if (last >= 2) {
      var keys = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) {
        if (String(keys[i][0]).trim().toLowerCase() === key) {
          return sheet.getRange(i + 2, 1).getValue();
        }
      }
    }

    var numbers = last >= 2 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
    var max = 0;
    for (var n = 0; n < numbers.length; n++) {
      var value = Number(numbers[n][0]);
      if (isFinite(value) && value > max) max = value;
    }
    var next = max + 1;
    sheet.appendRow([next, key, sted, new Date()]);
    return next;
  } finally {
    lock.releaseLock();
  }
}
