import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { EditButtons } from '../MiniComponents';
import { Card, Col, Container, Form, Row, Stack } from 'react-bootstrap';
import { useState } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch } from '../../hooks';
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { updateItem } from "../../stateSlices/EditSlice";

import { APISuccessData, GenericItem } from '../../types/Generics';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../../APIClient';
import { Item } from '../../types/API/Extras';
import SelectParentModal from './SelectParentModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';


type Props = {
  extras: Item[];
  requirementIndex: number;
  requirementID: number;
  requirementKey: string;
  show: boolean;
  setShow: (a: boolean) => void;

}

export default function ExtrasEditModal({ extras, requirementIndex, requirementID, requirementKey, show, setShow }: Props) {

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="extra-edit-card"
      onHide={() => { setShow(false) }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="extra-edit-card">
          Extras for {requirementKey}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
              {extras.map((item, index) => (<ExtraEditCard key={index} item={item} requirementIndex={requirementIndex} requirementID={requirementID} />))}
            </Col>
          </Row>
          <Row>
            <Col>
              <ExtraAddCard requirementIndex={requirementIndex} requirementID={requirementID}/>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

type ExtraEditProps = {
  item: Item;
  requirementIndex: number;
  requirementID: number;
}

function ExtraEditCard({ item, requirementIndex, requirementID }: ExtraEditProps) {
  const dispatch = useAppDispatch()


  const [content, setContent] = useState(item.content);
  const [edit, setEdit] = useState(false);
  const [force, setForce] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  function resetTempItem() {
    setContent(item.content)
  }

  function saveItem() {
    dispatch(showSpinner(true))
    APIClient.patch(`extraEntries/${item.id}?minimal=true`, { ...item, content: content }).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });
    setEdit(false)

    function okCallback(response: APISuccessData) {
      setContent((response.data as Item).content)
      dispatch(toast({ header: "Item successfully edited", body: `Item "${(response.data as GenericItem).id}" edited` }))
      APIClient.get(`requirements/${requirementID}`).then((response) => {
        handleResult(response, okUpdateCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    }
  }

  function okUpdateCallback(response: APISuccessData) {
    dispatch(updateItem({ index: requirementIndex, item: response.data as GenericItem }))
    dispatch(showSpinner(false))
  }

  function handleDeleteItem() {
    const parameters = []
    if (force) {
      parameters.push("force=true")
    }
    dispatch(showSpinner(true))
    APIClient.delete(`extraEntries/${item.id}?${parameters.join("&")}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });
    setEdit(false)
    setShowDeleteModal(false)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Item successfully deleted", body: `Item "${item.id}" deleted.` }))
      APIClient.get(`requirements/${requirementID}`).then((response) => {
        handleResult(response, okUpdateCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    }
  }

  return (
    <Card>
      <Card.Header>
        {item.extraType.title}
      </Card.Header>
      <Card.Body>
        <Card.Text>
          <Form.Control as="textarea" disabled={!edit} rows={3} id={`ExtraEntry-${item.id}`} value={content} onChange={e => { setContent(e.target.value) }} />
        </Card.Text>
      </Card.Body>
      <Card.Footer className="text-muted">
        <Stack direction="horizontal" gap={2}>
          <span className="">ID: <code>{item.id}</code></span>
          <span className="ms-auto"></span>
          <EditButtons saveItem={saveItem} edit={edit} setEdit={setEdit} resetTempItem={resetTempItem} setShowDeleteModal={setShowDeleteModal} small={true} />
        </Stack>
      </Card.Footer>
      <DeleteConfirmationModal show={showDeleteModal} item={String(item.id)} onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()} onForceChange={e => setForce(e)} force={force} needCascade={false} onCascadeChange={e => void (e)} />
    </Card>
  );
}


type ExtraAddProps = {
  requirementIndex: number;
  requirementID: number;
}

function ExtraAddCard({ requirementIndex, requirementID }: ExtraAddProps) {
  const dispatch = useAppDispatch()

  const blankItem = {
    content: "",
    extraTypeId: null,
    requirementId: requirementID,
  } as unknown as Item

  const [showSelectExtraTypeModal, setShowSelectExtraTypeModal] = useState(false);
  const [newItem, setNewItem] = useState(blankItem)

  function updateNewItem(properties: object) {
    const tempItem = { ...newItem, ...properties }
    setNewItem(tempItem)
  }

  function postItem() {
    dispatch(showSpinner(true))
    APIClient.post(`extraEntries`, newItem).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Item created", body: `Item "${(response.data as GenericItem).id}" created.` }))
      APIClient.get(`requirements/${requirementID}`).then((response) => {
        handleResult(response, okUpdateCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    }
  }

  function okUpdateCallback(response: APISuccessData) {
    dispatch(updateItem({ index: requirementIndex, item: response.data as GenericItem }))
    dispatch(showSpinner(false))
  }


  return (
    <Card>
      <Card.Header>{newItem.extraTypeId === null ? <Button variant="success" onClick={() => setShowSelectExtraTypeModal(true)}><FontAwesomeIcon icon="plus" /></Button> : <>New ExtraEntry for <code>{newItem.extraType.title}</code></>}</Card.Header>
      {newItem.extraTypeId !== null ? <><Card.Body>

        <Card.Text><Form.Control as="textarea" rows={3} id="new-content" value={newItem.content} onChange={e => { updateNewItem({ content: e.target.value }) }} />
        </Card.Text>
      </Card.Body>
        <Card.Footer className="text-muted">
          <Stack direction="horizontal" gap={2}>
            <span className="ms-auto"></span>
            <Button variant="success" size='sm' onClick={() => postItem()}>Add</Button>
            <Button variant="danger" size='sm' onClick={() => setNewItem(blankItem)}>Cancel</Button>
          </Stack>
        </Card.Footer></> : null}
      {showSelectExtraTypeModal ? <SelectParentModal
        itemId={newItem.id}
        humanKey={"ExtraEntry"}
        show={showSelectExtraTypeModal}
        setShow={setShowSelectExtraTypeModal}
        initialSelectedItem={newItem.extraTypeId}
        endpoint={"extraTypes"}
        updateItem={updateNewItem}
        updateIdField={"extraTypeId"}
        updateObjectField={"extraType"}
        checkCircle={false}
        columns={["title"]}
      ></SelectParentModal> : null}
    </Card>
  );
}
