import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row, Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../hooks';
import { ConfigurationItem } from './Configuration/ConfigurationItem';
import { loadConfiguration, removeDirty } from '../stateSlices/ConfigurationSlice';
import { showSpinner } from '../stateSlices/MainLogoSpinnerSlice';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../APIClient';
import { APISuccessData } from '../types/Generics';
import { Item } from '../types/API/Configuration';


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
export default function ConfigurationModal({ show, setShow }: Props) {
  const dispatch = useAppDispatch()
  const configuration = useAppSelector(state => state.configuration.configuration)
  const categories = useAppSelector(state => state.configuration.categories)

  function safeConfiguration() {
    dispatch(showSpinner(true))
    Object.keys(configuration).forEach((key) => {
      if (configuration[key].dirty == true) {
        APIClient.put(`config/${key}`, { ...configuration[key] }).then((response) => {
          handleResult(response, okCallback, APIErrorToastCallback)
        }).catch((error) => {
          handleError(error, APIErrorToastCallback, errorToastCallback)
        });
      }
    });

      function okCallback(response: APISuccessData) {
        dispatch(removeDirty((response.data as Item).key as string))
      }

    setShow(false)
  }

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="PreferencesModal"
      backdrop="static"
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
              <Container>
                {categories.map((item, index) => (
                  <Row key={index}>
                    <Col>
                      <Card>
                        <Card.Header as="h4">{item.category}</Card.Header>
                        <Card.Body>
                          <Container>
                            {item.keys.map((key, index) => (
                              <Row key={index}>
                                <Col>
                                  <ConfigurationItem item={configuration[key]} />
                                </Col>
                              </Row>
                            ))}
                          </Container>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ))}
              </Container>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => safeConfiguration()}>Save</Button>
        <Button variant="danger" onClick={() => { dispatch(loadConfiguration()); setShow(false) }}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
