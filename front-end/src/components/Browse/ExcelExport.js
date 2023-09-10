import { Button } from "react-bootstrap";
import XLSX from "xlsx";

export default function ExcelExport({headers, toExport, rows}) {


  function exportExcel() {
    var table_elt = document.getElementById("DataTable");
    var workbook = XLSX.utils.table_to_book(table_elt);
    XLSX.writeFile(workbook, "Report.xlsb");
  }

  return <Button onClick={exportExcel}></Button>
}