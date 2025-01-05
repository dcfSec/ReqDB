import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField, inSearchField, ErrorMessage } from '../MiniComponents';
import { Alert, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

import { useAppDispatch, useAppSelector } from '../../hooks';
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { updateCache, cleanCache } from "../../stateSlices/EditSlice";
import LoadingBar from '../LoadingBar';

import { Item as Topic } from '../../types/API/Topics';
import { Item as Tag } from '../../types/API/Tags';
import { Item as Requirement } from '../../types/API/Requirements';
import { APIErrorData, APISuccessData, RowObject } from '../../types/Generics';
import APIClient, { handleError, handleResult } from '../../APIClient';

type Props = {
  humanKey: string;
  show: boolean;
  setShow: (a: boolean) => void;
  initialSelectedItems?: Array<Topic | Tag | Requirement>;
  endpoint: string;
  columns: Array<string>;
  updateKey: string;
  updateItem: (a: object) => void;
  name: string;
}

/**
 * Component for a modal to select many elements to link to this object
 * 
 * @param {object} props Props for this component: humanKey, show, setShow, initialSelectedItems, endpoint, columns, updateKey, updateItem
 * @returns Returns a modal to select many
 */
export default function SelectMany({ humanKey, show, setShow, initialSelectedItems = [], endpoint, columns, updateKey, updateItem, name }: Props) {
  const dispatch = useAppDispatch()
  const cache = useAppSelector(state => state.edit.cache)

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const initialSelectedItemIds = initialSelectedItems.map((item) => (item.id))
  const [selectedItemIds, setSelectedItemIds] = useState(initialSelectedItemIds);


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
      const data = (cache[endpoint].data as APISuccessData).data
      body = <Form>
        <Table responsive>
          <thead>
            <tr>
              <th style={{ width: "0.5em" }}></th>
              {columns.map((item, index) => (<th key={index}>{item}</th>))}
            </tr>
          </thead>
          <tbody>
            {(data as RowObject[]).map((item: RowObject, index: number) => (getRenderRow(item as RowObject, index)))}
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

  function handleCheckboxChange(changeEvent: React.ChangeEvent<HTMLInputElement>) {
    const { value, checked } = changeEvent.target;

    if (checked === true && !selectedItemIds.includes(Number(value))) {
      setSelectedItemIds([...selectedItemIds, ...[Number(value)]])
    } else {
      const tempItem = selectedItemIds.filter(function (v) { return v !== Number(value); });
      setSelectedItemIds([...tempItem]);

    }
  };

  function updateParent() {
    const updateItemObject: Record<string, Array<object>> = {}
    const selectedItemObjects = selectedItemIds.map((key) => ({ id: key }))
    updateItemObject[updateKey] = [...selectedItemObjects]
    updateItem(updateItemObject)
    setShow(false)
  }

  function getRenderRow(item: RowObject, index: number) {
    return (search === "" || inSearchField(search, ["title", "key"], item) || selectedItemIds.includes(item.id)) ?
      <tr key={index}>
        <td style={{ width: "0.5em" }}><Form.Check name={String(item.id)} type="checkbox" aria-label={String(item.id)} reverse value={item.id} onChange={handleCheckboxChange} defaultChecked={initialSelectedItemIds.includes(item.id) && selectedItemIds.includes(item.id) ? true : false} /></td>
        {columns.map((column, cIndex) => (<td key={cIndex}>{item[column] as string}</td>))}
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
          Add {name} to <code>{humanKey}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col><SearchField title={name} search={search} onSearch={setSearch}></SearchField></Col>
            <Col xs={1}>
              <OverlayTrigger overlay={<Tooltip id="refresh-tooltip">Refresh list</Tooltip>}>
                <Button variant="outline-primary" onClick={() => reloadCache()}><FontAwesomeIcon icon={solid("arrows-rotate")} /></Button>
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
