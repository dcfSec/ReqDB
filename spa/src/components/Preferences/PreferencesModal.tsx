import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { showSpinner } from '../../stateSlices/MainLogoSpinnerSlice';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../../APIClients';
import { APISuccessData } from '../../types/Generics';
import { toast } from '../../stateSlices/NotificationToastSlice';
import { Notifications } from './Cards/Notifications';
import { Atlassian } from './Cards/Atlassian';


type Props = {
  show: boolean;
  setShow: (a: boolean) => void;
}

/**
 * Component for showing the user preferences
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
              <Notifications />
              <Atlassian />
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
