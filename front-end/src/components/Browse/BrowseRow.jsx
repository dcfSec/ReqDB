import { Badge, Button, Form } from "react-bootstrap";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { inSearchField } from "../MiniComponents";

import { useSelector, useDispatch } from 'react-redux'
import { toggleSelectRow, setVisibleRow } from '../../stateSlices/BrowseSlice';

import { useEffect, useState } from "react";


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, extraHeaders, row, search, tags, tagFiltered, topicFiltered, markRowCallback, markRowChecked
 * @returns A row for the browse view
 */
export default function BrowseRow({ index, row }) {

  const dispatch = useDispatch()
  const selected = useSelector(state => state.browse.rows.selected)
  const extraHeaders = useSelector(state => state.browse.extraHeaders)

  const tagFilterSelected = useSelector(state => state.browse.tags.filterSelected)
  const topicFilterSelected = useSelector(state => state.browse.topics.filterSelected)
  const search = useSelector(state => state.browse.search)

  const [visible, setVisible] = useState(true)

  useEffect(() => { dispatch(setVisibleRow({ id: row.id, visible })) }, [visible]);
  useEffect(() => { setVisible(isVisible()) }, [topicFilterSelected, tagFilterSelected, search]);

  const topicMaxlength = 40
  let badgeIdExtrafieldRunner = 0
  
  function isVisible() {
    const isVisible = inSearchField(search, Object.keys(row), row)
      && (/* tagFilterSelected.length === 0 || */ row.Tags.some(r => tagFilterSelected.indexOf(r) >= 0) || (row.Tags.length === 0 && tagFilterSelected.indexOf("No Tags") >= 0))
      && row.Topics.every(r => topicFilterSelected.indexOf(`${r.key} ${r.title}`) >= 0 )
    return isVisible
  }

  function renderExtraField(item, extraType) {
    if (extraHeaders[extraType] === 1) {
      return item
    } else if (extraHeaders[extraType] === 2) {
      return <ReactMarkdown>{item}</ReactMarkdown>
    } else if (extraHeaders[extraType] === 3) {
      console.log(item)
      return item ? item.split(";").map((badge) => (<span key={"extraFieldBade" + ++badgeIdExtrafieldRunner}><Badge bg="secondary">{badge}</Badge><br /></span>)) : null
    }
  }

  let renderRow = <tr key={row.Key}>
    <td className="vertical-middle"><Button className="eye-button" variant="primary" href={`/Browse/Requirement/${row.id}`}><FontAwesomeIcon icon={solid("link")} /></Button></td>
    <td>{row.Tags.map((tag) => (<span key={row.Key + " " + tag}><Badge bg="info">{tag}</Badge><br /></span>))}</td>
    <td>{row.Topics.map((topic) => (
      <span key={row.Key + " " + topic.key}>
        <OverlayTrigger overlay={<Tooltip id={"tooltip-" + row.Key + "-" + topic.key}>{topic.key} {topic.title}</Tooltip>}>
          <Badge bg="primary">{topic.key} {topic.title.length > topicMaxlength ? topic.title.substring(0, topicMaxlength) + "..." : topic.title}</Badge>
        </OverlayTrigger>
        <br />
      </span>
    ))}</td>
    <td>{row.Key}</td>
    <td>{row.Title}</td>
    <td><ReactMarkdown>{row.Description}</ReactMarkdown></td>
    {Object.keys(extraHeaders).map((extraHeader) => (<td key={row.Key + extraHeader}>{renderExtraField(row[extraHeader], extraHeader)}</td>))}
    <td><Form.Check inline id={String(index)} type="checkbox" aria-label="All" onChange={() => { dispatch(toggleSelectRow(row.id)) }} checked={selected[row.id]} /></td>
  </tr>

  return (visible ? renderRow : null )

}
