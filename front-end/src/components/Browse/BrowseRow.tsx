import { Badge, Button, Form } from "react-bootstrap";
import Markdown from 'react-markdown'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Stack from 'react-bootstrap/Stack';
import { useAppDispatch, useAppSelector } from "../../hooks";
import { toggleSelectRow } from '../../stateSlices/BrowseSlice';
import { appRoles } from '../../authConfig';

import { useState, memo } from "react";
import CommentModal from "../Comments/CommentModal";
import ExtraField from "./ExtraField";
import { Row } from "../../types/Generics";
import { setComments, setRequirementId } from "../../stateSlices/CommentSlice";
import LinkContainer from "../LinkContainer";


type Props = {
  index: number;
  row: Row;
}
/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, extraHeaders, row, search, tags, tagFiltered, topicFiltered, markRowCallback, markRowChecked
 * @returns A row for the browse view
 */
export default memo(function BrowseRow({ index, row }: Props) {

  const dispatch = useAppDispatch()
  const extraHeaders = useAppSelector(state => state.browse.extraHeaders)
  const roles = useAppSelector(state => state.user.roles)

  const [showComments, setShowComments] = useState(false)

  function showCommentsModal() {
    dispatch(setComments(row.Comments))
    dispatch(setRequirementId(row.id))
    setShowComments(true)
  }


  const topicMaxlength = 40

  const commentCount = [...row.Comments].filter((el) => el.completed == false).length
  const renderRow = <tr key={row.Key}>
    <td className="vertical-middle">
      <Stack gap={1}>
        <LinkContainer to={`/Browse/Requirement/${row.id}`}><Button className="eye-button" variant="primary"><FontAwesomeIcon icon={"link"} /></Button></LinkContainer>
        { roles.includes(appRoles.Comments.Reader) ? <Button className="eye-button" variant="primary" onClick={() => { showCommentsModal() }} style={{ position: "relative" }}><FontAwesomeIcon icon={"comment"} />
        { commentCount > 0 ? <><Badge pill bg="success" style={{position: 'absolute', marginTop: '1.5em', marginLeft: '-0.5em'}}>{commentCount}</Badge><span className="visually-hidden">comments</span></> : null }</Button> : null }
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
    <td><Markdown>{row.Description}</Markdown></td>
    {Object.keys(extraHeaders).map((extraHeader) => (<td key={row.Key + extraHeader}><ExtraField index={index} extraType={extraHeaders[extraHeader]} item={row[extraHeader] as string} lineBreak={true}/></td>))}
    <td><Form.Check inline id={String(index)} type="checkbox" aria-label="All" onChange={() => { dispatch(toggleSelectRow(index)) }} checked={row.selected} /></td>
    { roles.includes(appRoles.Comments.Reader) ? <CommentModal requirementIndex={index} title={row.Title} show={showComments} setShow={setShowComments}></CommentModal> : null }
  </tr>

  return (row.visible ? renderRow : null )

})
