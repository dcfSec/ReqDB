import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField, inSearchField, ErrorMessage } from '../MiniComponents';
import { Alert, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { updateCache, cleanCache } from "../../stateSlices/EditSlice";

import LoadingBar from '../LoadingBar';
import { APIErrorData, APISuccessData, RowObject } from '../../types/Generics';
import APIClient, { handleError, handleResult } from '../../APIClient';


type Props = {
  itemId: number;
  humanKey: string;
  show: boolean;
  setShow: (a: boolean) => void;
  initialSelectedItem: number
  updateItem: (a: object) => void;
  updateIdField: string;
  updateObjectField: string;
  checkCircle: boolean;
  endpoint: string;
  columns: Array<string>;
}
/**
 * Component to show the option to select a parent model
 * 
 * @param {object} props Props for the component: itemId, humanKey, show, setShow, initialSelectedItem, updateItem, updateIdField, updateObjectField, checkCircle, endpoint, columns
 * @returns A modal to select a parent model
 */
export default function SelectParentModal({ itemId, humanKey, show, setShow, initialSelectedItem, updateItem, updateIdField, updateObjectField, checkCircle, endpoint, columns }: Props) {
  const dispatch = useAppDispatch()
  const cache = useAppSelector(state => state.edit.cache)

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  let selectedItemObjects: Array<RowObject> = []
  let selectedItemId: string = "0"

  function onSelect(id: string) {
    selectedItemId = id
  }


  function okCallback(response: APISuccessData) {
    dispatch(updateCache({ endpoint, response: response }))
  }

  function APIErrorCallback(response: APIErrorData) {
    setError(response.message as string)
  }

  function errorCallback(error: string) {
    setError(error)
  }

  function reloadCache() {
    dispatch(showSpinner(true))
    dispatch(cleanCache({ endpoint }))
    APIClient.get(`${endpoint}`).then((response) => {
      handleResult(response, okCallback, APIErrorCallback)
    }).catch((error) => {
      handleError(error, APIErrorCallback, errorCallback)
    });
  }

  useEffect(() => {
    dispatch(showSpinner(true))
    if (!(endpoint in cache) || cache[endpoint].time + 36000 < Date.now()) {
      dispatch(cleanCache({ endpoint }))
      APIClient.get(`${endpoint}`).then((response) => {
        handleResult(response, okCallback, APIErrorCallback)
      }).catch((error) => {
        handleError(error, APIErrorCallback, errorCallback)
      });
    } else {
      dispatch(showSpinner(false))
    }
  }, [])

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error: {error}</Alert>
  } else {
    if (endpoint in cache && cache[endpoint].data && cache[endpoint].data.status === 200) {
      selectedItemObjects = (cache[endpoint].data as APISuccessData).data as Array<RowObject>
      body = <Form onChange={(e) => onSelect((e.target as HTMLFormElement).value)}>
        <Table responsive>
          <thead>
            <tr>
              <th style={{ width: "0.5em" }}></th>
              {columns.map((item, index) => (<th key={index}>{item}</th>))}
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ width: "0.5em" }}><Form.Check name="itemSelect" type="radio" aria-label="None" reverse value="-1" defaultChecked={initialSelectedItem === null ? true : false} /></td>
              {columns.map((column, cIndex) => (<td key={cIndex}>None</td>))}</tr>
            {selectedItemObjects.map((item, index) => (getRenderRow(item, index)))}
          </tbody>
        </Table>
      </Form>
    } else if (endpoint in cache && cache[endpoint].data.status !== 200) {
      dispatch(toast({ header: (cache[endpoint].data as APIErrorData).error, body: String((cache[endpoint].data as APIErrorData).message) }))
      body = <Alert variant="danger">{ErrorMessage((cache[endpoint].data as APIErrorData).message)}</Alert>
    }
  }

  function reset() {
    setShow(false)
    setSearch("")
  }

  function updateParent() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateItemObject: any = {}
    if (selectedItemId === "-1") {
      updateItemObject[updateIdField] = null
      updateItemObject[updateObjectField] = null
      updateItem(updateItemObject)
    } else {
      updateItemObject[updateIdField] = Number(selectedItemObjects[Number(selectedItemId)].id)
      updateItemObject[updateObjectField] = selectedItemObjects[Number(selectedItemId)]
      updateItem(updateItemObject)
    }
    setShow(false)
  }

  function getRenderRow(item: RowObject, index: number) {
    return (search === "" || inSearchField(search, columns, item) || `${item.id}` === selectedItemId) && !(checkCircle === true && itemId === item.id) ?
      <tr key={index}>
        <td style={{ width: "0.5em" }}><Form.Check name="itemSelect" type="radio" aria-label={String(item.id)} reverse value={index} defaultChecked={initialSelectedItem === item.id ? true : false} /></td>
        {columns.map((column, cIndex) => (<td key={cIndex}>{item[column]}</td>))}
      </tr>
      : null

  }

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      onHide={() => { reset() }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Select {updateObjectField} for <code>{humanKey ? humanKey : "new item"}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col><SearchField title={updateObjectField} search={search} onSearch={setSearch}></SearchField></Col>
            <Col xs={1}>
              <OverlayTrigger overlay={<Tooltip id="refresh-tooltip">Refresh list</Tooltip>}>
                <Button variant="outline-primary" onClick={() => reloadCache()}><FontAwesomeIcon icon={"arrows-rotate"} /></Button>
              </OverlayTrigger>
            </Col>
          </Row>
          <Row>
            {body}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => updateParent()}>Select</Button>
        <Button variant="secondary" onClick={() => reset()}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
