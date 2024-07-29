import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux'

/**
 * Component for the filter modal for topics in the brows view
 * 
 * @param {object} param0 Props for this component: show, setShow, topics, setFilteredTopics, filteredTopics
 * @returns Returns a modal for filtering topics in the browse view
 */
export default function RolesModal({ show, setShow }) {
  const roles = useSelector(state => state.user.roles)

  return (
    <Modal
      show={show}
      aria-labelledby="myRolesModal"
      onHide={() => { setShow(false) }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="myRolesModal">
          My Roles
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
            <p>Your role(s) are:</p>
              <ul>
                {[...roles].sort().map((role) => (<li key={role}><code>{role}</code></li>))}
              </ul>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
