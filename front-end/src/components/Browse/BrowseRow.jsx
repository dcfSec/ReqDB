import { Badge, Button, Form } from "react-bootstrap";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { inSearchField } from "../MiniComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, extraHeaders, extraHeaderTypes, row, search, tags, tagFiltered, topicFiltered, markRowCallback, markRowChecked
 * @returns A row for the browse view
 */
export default function BrowseRow({ index, extraHeaders, extraHeaderTypes, row, search, tags, tagFiltered, topicFiltered, markRowCallback, markRowChecked = [] }) {

  function renderExtraField(item, extraType) {
    if (extraHeaderTypes[extraType] === 1) {
      return item
    } else if (extraHeaderTypes[extraType] === 2) {
      return <ReactMarkdown>{item}</ReactMarkdown>
    } else if (extraHeaderTypes[extraType] === 3) { //@TODO: Implement
      return item
    }
  }

  if (inSearchField(search, Object.keys(row), row) && (tags.length === 0 || row.Tags.some(r => tagFiltered.indexOf(r) >= 0)) && row.Topics.some(r => topicFiltered.indexOf(`${r.key} ${r.title}`) >= 0)) {
    return (
      <tr key={row.Key}>
        <td className="vertical-middle"><Button className="eye-button" variant="primary" href={`/Browse/Requirement/${row.id}`}><FontAwesomeIcon icon={solid("link")} /></Button></td>
        <td>{row.Tags.map((tag) => (<span key={row.Key + " " + tag}><Badge bg="info">{tag}</Badge><br /></span>))}</td>
        <td>{row.Topics.map((topic) => (<span key={row.Key + " " + topic.key}><Badge bg="primary">{topic.key} {topic.title}</Badge><br /></span>))}</td>
        <td>{row.Key}</td>
        <td>{row.Title}</td>
        <td><ReactMarkdown>{row.Description}</ReactMarkdown></td>
        {extraHeaders.map((extraHeader) => (<td key={row.Key + extraHeader}>{renderExtraField(row[extraHeader], extraHeader)}</td>))}
        <td><Form.Check inline id={String(index)} type="checkbox" aria-label="All" onChange={markRowCallback} checked={markRowChecked.includes(index)} /></td>
      </tr>
    )
  } else {
    return null
  }
}
