import Dropdown from 'react-bootstrap/Dropdown';
import * as yaml from 'js-yaml';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip, { TooltipProps } from 'react-bootstrap/Tooltip';
import { stringify } from 'csv-stringify/browser/esm';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { RefAttributes, useEffect, useState } from 'react';
import { JSX } from 'react/jsx-runtime';
import { saveAs } from '../MiniComponents';
import { Item as Topic } from '../../types/API/Topics';
import { Item as Requirement } from '../../types/API/Requirements';
import JiraExportModal from './Jira/Modal';
import { loadAtlassianConfiguration } from '../../stateSlices/AtlassianSlice';

/**
 * Exports the browse table in different formats
 * 
 * @returns Returns a dropdown for export selection
 */
export function ExportTable() {
  const dispatch = useAppDispatch()

  const data = useAppSelector(state => state.browse.data)
  const items = useAppSelector(state => state.browse.rows.items)
  const rowsToExport = [...useAppSelector(state => state.browse.rows.items).filter(function (v) { return v.selected === true; })]

  useEffect(() => {
    dispatch(loadAtlassianConfiguration())
  }, [])


  const atlassianEnabled = useAppSelector(state => state.atlassian.enabled)

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

  function exportMarkdown() {

    const dataToExport = { ...data }
    dataToExport.topics = dataToExport.topics?.map((topic) => (getExportObject(topic))).filter(function (v) { return v !== null; });

    const fileType = 'data:text/plain;charset=utf-8;';
    let mdToExport = `# [${dataToExport.key}] ${dataToExport.title}\n\n`
    mdToExport = mdToExport + dataToExport.topics?.map((topic) => (buildMarkdownTopics(2, topic))).join("\n\n");
    const blob = new Blob([mdToExport], { type: fileType });
    saveAs(blob, "ReqDB-Export.md");
  }

  function buildMarkdownTopics(titleDepth: number, topic: Topic): string {
    let r = `${"#".repeat(titleDepth)} [${topic.key}] ${topic.title}\n\n${topic.description}\n\n`;

    if (topic.children.length != 0)
      r = r + topic.children?.map((child) => (buildMarkdownTopics(titleDepth + 1, child))).join("\n\n");
    if (topic.requirements.length != 0)
      r = r + topic.requirements?.map((child) => (buildMarkdownRequirements(titleDepth + 1, child))).join("\n\n");

    return r;
  }

  function buildMarkdownRequirements(titleDepth: number, requirement: Requirement): string {
    let r = `${"#".repeat(titleDepth)} [${requirement.key}] ${requirement.title}\n\n${requirement.tags.map((tag) => (`${tag.name}`)).join(", ")}\n\n${requirement.description}\n\n`;

    r = r + requirement.extras?.map((extra) => (`${"#".repeat(titleDepth + 1)} ${extra.extraType.title}\n\n${extra.content}\n\n`)).join("\n\n");
    return r;
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

  const [showJiraModal, setShowJiraModal] = useState(false);

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
        <Dropdown.Item onClick={exportMarkdown} disabled={rowsToExport.length === 0}>As Markdown</Dropdown.Item>
        {atlassianEnabled ? <Dropdown.Item onClick={() => { setShowJiraModal(true) }} disabled={rowsToExport.length === 0}>To Jira</Dropdown.Item> : null}
      </Dropdown.Menu>
      {atlassianEnabled && showJiraModal ? <JiraExportModal show={showJiraModal} setShow={setShowJiraModal} rowsToExport={rowsToExport} /> : null}
    </Dropdown>
  );
}
