import Dropdown from 'react-bootstrap/Dropdown';
import ExcelJS from "exceljs";
import * as yaml from 'js-yaml';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip, { TooltipProps } from 'react-bootstrap/Tooltip';

import { useAppSelector } from '../hooks';
import { RefAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { saveAs } from './MiniComponents';

/**
 * Exports the browse table in different formats
 * 
 * @returns Returns a dropdown for export selection
 */
export function ExportTable() {

  const selected = useAppSelector(state => state.browse.rows.selected)
  const visible = useAppSelector(state => state.browse.rows.visible)
  const dataToExport = [...useAppSelector(state => state.browse.rows.items).filter(function (v) { return selected[v.id] === true; })]

  const headers = [
    "Tags",
    "Topics",
    "Key",
    "Title",
    "Description",
    ...Object.keys(useAppSelector(state => state.browse.extraHeaders))
  ]

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
        console.error(err.message)
      });
  }

  function exportJson() {
    const fileType = 'data:text/json;charset=utf-8;';
    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: fileType });
    saveAs(blob, "ReqDB-Export.json");
  }

  function exportYaml() {
    const fileType = 'data:text/yaml;charset=utf-8;';
    const blob = new Blob([yaml.dump(dataToExport)], { type: fileType });
    saveAs(blob, "ReqDB-Export.yaml");
  }

  const renderTooltip = (props: JSX.IntrinsicAttributes & TooltipProps & RefAttributes<HTMLDivElement>) => (
    dataToExport.length === 0 ?
    <Tooltip id="export-tooltip" {...props}>
      First select the rows you want to export 
    </Tooltip> : <></>
  );

  return (
    <Dropdown>
      <OverlayTrigger
        placement="top"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
      >
        <Dropdown.Toggle variant="success" id="export-dropdown">
          Export {dataToExport.length}/{Object.values(visible).reduce((a, item) => a + Number(item), 0)} rows
        </Dropdown.Toggle>
      </OverlayTrigger>
      <Dropdown.Menu>
        <Dropdown.Item onClick={exportExcel}>As Excel</Dropdown.Item>
        <Dropdown.Item onClick={exportJson}>As JSON</Dropdown.Item>
        <Dropdown.Item onClick={exportYaml}>As Yaml</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
