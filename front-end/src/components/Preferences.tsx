import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Col, Container, Row, Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../hooks';
import { toggleUserConfiguration } from '../stateSlices/UserSlice';
import { showSpinner } from '../stateSlices/MainLogoSpinnerSlice';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../APIClient';
import { APISuccessData } from '../types/Generics';
import { toast } from '../stateSlices/NotificationToastSlice';


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
  const preferences = useAppSelector(state => state.user.preferences)
  const dispatch = useAppDispatch()

  function safeConfiguration() {
    dispatch(showSpinner(true))
    APIClient.patch(`config/user`, {
      notificationMailOnCommentChain: preferences.notificationMailOnCommentChain,
      notificationMailOnRequirementComment: preferences.notificationMailOnRequirementComment
    }).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "User Setting Updated", body: "User setting successfully updated" }))
      setShow(false)
    }
  }

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
                  Send an E-Mail when
                  <Form.Check type="switch" id="notification-comment-chain-switch" label="someone replies to a comment chain I'm participating in" onChange={(e) => dispatch(toggleUserConfiguration({ id: e.target.id, checked: e.target.checked }))} checked={preferences.notificationMailOnCommentChain} />
                  <Form.Check type="switch" id="notification-comment-requirement-switch" label="someone adds a new comment to a requirement" onChange={(e) => dispatch(toggleUserConfiguration({ id: e.target.id, checked: e.target.checked }))} checked={preferences.notificationMailOnRequirementComment}/>
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
        <Button variant="success" onClick={() => safeConfiguration()}>Save</Button>
        <Button variant="primary" onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
