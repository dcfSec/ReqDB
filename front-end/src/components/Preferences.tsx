import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Col, Container, Row, Card } from 'react-bootstrap';
// import { useAppSelector } from "../hooks";


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
export default function Preferences({ show, setShow }: Props) {
  // const preferences = useAppSelector(state => state.user.preferences)

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="PreferencesModal"
      onHide={() => { setShow(false) }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="PreferencesModal">
          Preferences
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
              <Card>
                <Card.Header as="h4">Notifications (E-Mail)</Card.Header>
                <Card.Body>
                  <p>Send an E-Mail when
                    <Form.Check type="switch" id="notification-comment-chain-switch" label="someone replies to a comment chain I'm participating in" />
                    <Form.Check type="switch" id="notification-comment-requirement-switch" label="someone adds a new comment to a requirement" />
                  </p>
                </Card.Body>
              </Card>
              <Card>
                <Card.Header as="h4">Something</Card.Header>
                <Card.Body>
                  <Form.Check type="switch" id="something-yyy-switch" label="yyy" />
                  <Form.Check type="switch" id="something-xxx-switch" label="xxx" />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => setShow(false)}>Save</Button>
        <Button variant="primary" onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
