function doGet(e) {
  var params = (e && e.parameter) || {};
  if (params.action !== "dashboard") {
    return dashboardOutput_({ status: "ok" }, params.callback);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return dashboardOutput_([], params.callback);
  }

  var headers = values.shift().map(function (header) {
    return String(header).trim();
  });

  var rows = values.map(function (row) {
    var item = {};
    headers.forEach(function (header, index) {
      var key = header || "kolom" + (index + 1);
      var value = row[index];
      if (Object.prototype.toString.call(value) === "[object Date]") {
        value = Utilities.formatDate(
          value,
          Session.getScriptTimeZone(),
          "yyyy-MM-dd"
        );
      }
      item[key] = value;
    });
    return item;
  });

  return dashboardOutput_(rows, params.callback);
}

function dashboardOutput_(data, callback) {
  var body = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + body + ");").setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(body).setMimeType(
    ContentService.MimeType.JSON
  );
}
