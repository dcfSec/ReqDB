import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row, Form } from 'react-bootstrap';

import { useSelector } from 'react-redux'
import CommentEntry from "./CommentEntry"
import AddComment from "./AddComment"
import { appRoles } from '../../authConfig';
import { useState } from "react";

import Stack from 'react-bootstrap/Stack';

/**
 * Component for a modal to view and add comments
 * 
 * @param {object} props Props for this component: humanKey, show, setShow, initialSelectedItems, endpoint, columns, updateKey, updateItem
 * @returns Returns a modal to select many
 */
export default function CommentModal({ index, show, setShow }) {

  const row = useSelector(state => state.browse.rows.items)[index]
  const roles = useSelector(state => state.user.roles)

  const [showCompleted, setShowCompleted] = useState(false);

  function close() {
    setShow(false)
  }

  const completedCount = [...row.Comments].filter((el) => el.completed == true).length

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      onHide={() => { close() }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Comments for <code>{row["Title"]}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          { completedCount > 0 ?
          <Row>
            <Col><Form.Check type="switch" id="completed" defaultChecked={showCompleted} onChange={e => { setShowCompleted(e.target.checked) }} label={`${completedCount} comments completed. Show completed`} reverse/></Col>
          </Row> : null}
          <Row>
            <Col>{[...row["Comments"]].sort((a, b) => a.id - b.id).map((item, commentIndex) => <CommentEntry view={"browse"} rowIndex={index} commentIndex={commentIndex} comment={item} key={`comment-${commentIndex}`} showCompleted={showCompleted}/>)}</Col>
          </Row>
          <Row>
            <Col>
            { roles.includes(appRoles.Comments.Writer) ? <AddComment view={"browse"} index={index} requirementId={row["id"]} /> : null }
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Stack direction="horizontal" gap={3}>
        </Stack>
        <Button variant="secondary" onClick={() => close()}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
