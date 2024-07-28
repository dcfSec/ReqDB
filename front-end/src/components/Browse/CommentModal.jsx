import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row } from 'react-bootstrap';

import { useSelector } from 'react-redux'
import CommentEntry from "../Comment/CommentEntry"
import AddComment from "../Comment/AddComment"
import { appRoles } from '../../authConfig';

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

  function close() {
    setShow(false)
  }

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
          <Row>
            <Col>{[...row["Comments"]].sort((a, b) => a.id - b.id).map((item, commentIndex) => <CommentEntry rowIndex={index} commentIndex={commentIndex} comment={item} key={`comment-${commentIndex}`} />)}</Col>
          </Row>
          <Row>
            <Col>
            { roles.includes(appRoles.Comments.Writer) ? <AddComment index={index} requirementId={row["id"]} /> : null }
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
