let idTmr

function getExplorer () {
  const explorer = window.navigator.userAgent
  //ie
  if (explorer.indexOf('MSIE') >= 0) {
    return 'ie'
  }
  //firefox
  else if (explorer.indexOf('Firefox') >= 0) {
    return 'Firefox'
  }
  //Chrome
  else if (explorer.indexOf('Chrome') >= 0) {
    return 'Chrome'
  }
  //Opera
  else if (explorer.indexOf('Opera') >= 0) {
    return 'Opera'
  }
  //Safari
  else if (explorer.indexOf('Safari') >= 0) {
    return 'Safari'
  }
}

const tableToExcel = (function () {
  const uri = 'data:application/vnd.ms-excel;base64,',
    template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',
    base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)))
    },
    format = function (s, c) {
      return s.replace(/{(\w+)}/g,
        function (m, p) { return c[p] })
    }
  return function (table, name) {
    if (!table.nodeType) table = document.getElementById(table)
    const ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
    window.location.href = uri + base64(format(template, ctx))
  }
})()

function Cleanup () {
  window.clearInterval(idTmr)
}

function exportExcel (tableDom) {
  if (getExplorer() == 'ie') {
    let curTbl = tableDom
    let oXL = new ActiveXObject('Excel.Application')
    let oWB = oXL.Workbooks.Add()
    let xlsheet = oWB.Worksheets(1)
    let sel = document.body.createTextRange()
    sel.moveToElementText(curTbl)
    sel.select()
    sel.execCommand('Copy')
    xlsheet.Paste()
    oXL.Visible = true

    let fname

    try {
      fname = oXL.Application.GetSaveAsFilename('Excel.xls', 'Excel Spreadsheets (*.xls), *.xls')
    } catch (e) {
      console.error('Nested catch caught ' + e.toString())
    } finally {
      oWB.SaveAs(fname)
      oWB.Close(savechanges = false)
      oXL.Quit()
      oXL = null
      idTmr = window.setInterval('Cleanup();', 1)
    }
    return
  }

  tableToExcel(tableDom)
}

export default exportExcel
