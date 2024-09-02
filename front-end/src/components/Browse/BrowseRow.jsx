import { Badge, Button, Form } from "react-bootstrap";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { inSearchField } from "../MiniComponents";
import Stack from 'react-bootstrap/Stack';
import { useSelector, useDispatch } from 'react-redux'
import { toggleSelectRow, setVisibleRow } from '../../stateSlices/BrowseSlice';
import { appRoles } from '../../authConfig';
import { Link } from "react-router-dom";

import { useEffect, useState, memo } from "react";
import CommentModal from "../Comments/CommentModal";
import ExtraField from "./ExtraField";


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, extraHeaders, row, search, tags, tagFiltered, topicFiltered, markRowCallback, markRowChecked
 * @returns A row for the browse view
 */
export default memo(function BrowseRow({ index, row }) {

  const dispatch = useDispatch()
  const selected = useSelector(state => state.browse.rows.selected)
  const extraHeaders = useSelector(state => state.browse.extraHeaders)
  const roles = useSelector(state => state.user.roles)

  const visible = useSelector(state => state.browse.rows.visible)[row.id]

  //const [visible, setVisible] = useState(true)
  const [showComments, setShowComments] = useState(false)

  const topicMaxlength = 40

  const commentCount = [...row.Comments].filter((el) => el.completed == false).length
  let renderRow = <tr key={row.Key}>
    <td className="vertical-middle">
      <Stack gap={1}>
        <Button className="eye-button" variant="primary" as={Link} to={`/Browse/Requirement/${row.id}`}><FontAwesomeIcon icon={solid("link")} /></Button>
        <Button className="eye-button" variant="primary" onClick={() => { setShowComments(true) }} style={{ position: "relative" }}><FontAwesomeIcon icon={solid("comment")} />
        { roles.includes(appRoles.Comments.Reader) ? commentCount > 0 ? <><Badge pill bg="success" style={{position: 'absolute', marginTop: '1.5em', marginLeft: '-0.5em'}}>{commentCount}</Badge><span className="visually-hidden">comments</span></> : null : null }</Button>
      </Stack>
    </td>
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
    {Object.keys(extraHeaders).map((extraHeader) => (<td key={row.Key + extraHeader}><ExtraField index={index} extraType={extraHeaders[extraHeader]} item={row[extraHeader]} lineBreak={true}/></td>))}
    <td><Form.Check inline id={String(index)} type="checkbox" aria-label="All" onChange={() => { dispatch(toggleSelectRow(row.id)) }} checked={selected[row.id]} /></td>
    { roles.includes(appRoles.Comments.Reader) ? <CommentModal index={index} show={showComments} setShow={setShowComments}></CommentModal> : null }
  </tr>

  return (visible ? renderRow : null )

})
