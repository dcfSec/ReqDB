import { Col, Container, Row, Form } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import CommentEntry from "./CommentEntry"
import AddComment from "./AddComment"
import { appRoles } from '../../authConfig';
import { useState } from "react";
import { Item } from '../../types/API/Comments';


/**
 * Component for a modal to view and add comments
 * 
 * @param {object} props Props for this component: humanKey, show, setShow, initialSelectedItems, endpoint, columns, updateKey, updateItem
 * @returns Returns a modal to select many
 */
export default function CommentsBase() {

  const comments = useAppSelector(state => state.comment.comments)
  const roles = useAppSelector(state => state.user.roles)

  const [showCompleted, setShowCompleted] = useState(false);
  const [replyTo, setReplyTo] = useState<Item | null>(null);


  const completedCount = [...comments].filter((el) => el.completed == true).length

  return (
    <Container>
      {completedCount > 0 ?
        <Row>
          <Col><Form.Check type="switch" id="completed" defaultChecked={showCompleted} onChange={e => { setShowCompleted(e.target.checked) }} label={`${completedCount} comments completed. Show completed`} reverse /></Col>
        </Row> : null}
      <Row>
        <Col>{[...comments].map((item, index) => item.parentId == null ? <CommentEntry index={index} comment={item} key={`comment-${index}`} showCompleted={showCompleted} setReply={setReplyTo} /> : null)}</Col>
      </Row>
      <Row>
        <Col>
          {roles.includes(appRoles.Comments.Writer) ? <AddComment replyTo={replyTo} replyToText={replyTo != null ? replyTo.comment : ""} setReply={setReplyTo} /> : null}
        </Col>
      </Row>
    </Container>
  );
}
