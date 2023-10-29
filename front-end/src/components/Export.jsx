import Dropdown from 'react-bootstrap/Dropdown';
import ExcelJS from "exceljs";

/**
 * Exports the browse table in different formats
 * 
 * @param {object} props Props for the component: headers, dataToExport
 * @returns Returns a dropdown for export selection
 */
export function ExportTable({ headers, dataToExport }) {

  function exportExcel() {

    const exportData = dataToExport.map((row) => ({ ...row, ...{ Tags: row.Tags.join("\r\n"), Topics: row.Topics.map((topic) => (topic.title)).join("\r\n") } }));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ReqDB';
    const sheet = workbook.addWorksheet('ReqDB export', { views: [{ state: 'frozen', ySplit: 1 }] });

    sheet.columns = headers.map((header) => ({ header, key: header, width: 30, style: { alignment: { wrapText: true } } }));

    sheet.addRows(exportData);

    sheet.autoFilter = `A1:${String.fromCharCode(64 + headers.length)}1`;

    workbook.xlsx.writeBuffer().then(data => {
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([data], { type: fileType });
      saveAs(blob, "ReqDB-Export.xlsx");
    })
      .catch(err => {
        console.log(err.message);
      });
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="export-dropdown">
        Export selected
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={exportExcel}>As Excel</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}


/** 
 * Save blob as file (See https://github.com/eligrey/FileSaver.js/issues/774)
 * 
 * @param {Blob} blob
 * @param {string} name
*/
function saveAs(blob, name) {
  // Namespace is used to prevent conflict w/ Chrome Poper Blocker extension (Issue https://github.com/eligrey/FileSaver.js/issues/561)
  const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
  a.download = name
  a.rel = 'noopener'
  a.href = URL.createObjectURL(blob)

  a.click()
  URL.revokeObjectURL(a.href)
  
  // setTimeout(() => URL.revokeObjectURL(a.href), 40 /* sec */ * 1000)
  // setTimeout(() => a.click(), 0)
}