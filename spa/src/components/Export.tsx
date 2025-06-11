import Dropdown from 'react-bootstrap/Dropdown';
import * as yaml from 'js-yaml';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip, { TooltipProps } from 'react-bootstrap/Tooltip';
import { stringify } from 'csv-stringify/browser/esm';

import { useAppSelector } from '../hooks';
import { RefAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { saveAs } from './MiniComponents';
import { Item as Topic } from '../types/API/Topics';

/**
 * Exports the browse table in different formats
 * 
 * @returns Returns a dropdown for export selection
 */
export function ExportTable() {

  const data = useAppSelector(state => state.browse.data)
  const items = useAppSelector(state => state.browse.rows.items)
  const rowsToExport = [...useAppSelector(state => state.browse.rows.items).filter(function (v) { return v.selected === true; })]

  function exportCSV() {

    const exportData = rowsToExport.map((row) => ({
      ...Object.keys(row).filter((key) =>
        !["id", "visible", "selected", "Comments", "path"].includes(key)
      ).reduce((obj: { [key: string]: unknown }, key) => {
        obj[key] = row[key];
        return obj;
      }, {}), ...{ Tags: row.Tags.join("\r\n"), Topics: row.Topics.map((topic) => (topic.title)).join("\r\n") }
    }));

    stringify(
      exportData,
      {
        header: true,
      },
      function (err, data) {
        const fileType = 'data:text/csv;charset=utf-8;';
        const blob = new Blob([data], { type: fileType });
        saveAs(blob, "ReqDB-Export.csv");
      },
    );
  }

  function getExportObject(currentTopic: Topic): Topic | null {

    const requirements = currentTopic.requirements.filter(function (v) { return v.selected === true; })
    const children = [...currentTopic.children.map((topic) => (getExportObject(topic))).filter(function (v) { return v !== null; })]

    if (children.length == 0 && requirements.length == 0) {
      return null;
    } else {
      return {
        description: currentTopic.description,
        parentId: currentTopic.parentId,
        requirements: requirements,
        key: currentTopic.key,
        title: currentTopic.title,
        children: children,
        id: currentTopic.id
      };
    }
  }

  function exportJson() {

    const dataToExport = { ...data }
    dataToExport.topics = dataToExport.topics?.map((topic) => (getExportObject(topic))).filter(function (v) { return v !== null; });

    const fileType = 'data:text/json;charset=utf-8;';
    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: fileType });
    saveAs(blob, "ReqDB-Export.json");
  }

  function exportYaml() {

    const dataToExport = { ...data }
    dataToExport.topics = dataToExport.topics?.map((topic) => (getExportObject(topic))).filter(function (v) { return v !== null; });

    const fileType = 'data:text/yaml;charset=utf-8;';
    const blob = new Blob([yaml.dump(dataToExport)], { type: fileType });
    saveAs(blob, "ReqDB-Export.yaml");
  }

  const renderTooltip = (props: JSX.IntrinsicAttributes & TooltipProps & RefAttributes<HTMLDivElement>) => (
    <Tooltip id="export-tooltip" {...props}>
      {rowsToExport.length === 0 ? "First select the rows you want to export" : "Export the selected requirements"}
    </Tooltip>
  );

  return (
    <Dropdown>
      <OverlayTrigger
        placement="top"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
      >
        <Dropdown.Toggle variant="success" id="export-dropdown">
          Export {rowsToExport.length}/{items.length} rows
        </Dropdown.Toggle>
      </OverlayTrigger>
      <Dropdown.Menu>
        <Dropdown.Item onClick={exportCSV} disabled={rowsToExport.length === 0}>As CSV</Dropdown.Item>
        <Dropdown.Item onClick={exportJson} disabled={rowsToExport.length === 0}>As JSON</Dropdown.Item>
        <Dropdown.Item onClick={exportYaml} disabled={rowsToExport.length === 0}>As Yaml</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
