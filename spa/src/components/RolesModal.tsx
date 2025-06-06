import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row } from 'react-bootstrap';
import { useAppSelector } from "../hooks";


type Props = {
  show: boolean;
  setShow: (a: boolean) => void;
}

/**
 * Component for showing the own roles
 * 
 * @param {object} param Props for this component: show, setShow
 * @returns Returns a modal for viewing the own roles
 */
export default function RolesModal({ show, setShow }: Props) {
  const roles = useAppSelector(state => state.user.roles)

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
