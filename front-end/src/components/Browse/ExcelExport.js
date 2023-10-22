import { Button } from "react-bootstrap";
import XLSX from "xlsx";

/**
 * Component for the button to export the selected  item as excel file
 * 
 * @param {object} props Props for this component: headers, toExport, rows
 * @returns Returns a button for the export to excel
 */
export default function ExcelExport({ headers, toExport, rows }) {

  function exportExcel() {
    var table_elt = document.getElementById("DataTable");
    var workbook = XLSX.utils.table_to_book(table_elt);
    XLSX.writeFile(workbook, "Report.xlsb");
  }

  return <Button onClick={exportExcel}></Button>
}
