import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField, inSearchField, ErrorMessage } from '../MiniComponents';
import { Alert, Col, Container, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import useFetchWithMsal from '../../hooks/useFetchWithMsal';
import { protectedResources } from '../../authConfig';

import { useDispatch } from 'react-redux'
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";

/**
 * Component to show the option to select a parent model
 * 
 * @param {object} props Props for the component: itemId, humanKey, show, setShow, initialSelectedItem, updateItem, updateIdField, updateObjectField, checkCircle, endpoint, columns
 * @returns A modal to select a parent model
 */
export default function SelectParentModal({ itemId, humanKey, show, setShow, initialSelectedItem, updateItem, updateIdField, updateObjectField, checkCircle, endpoint, columns }) {
  const dispatch = useDispatch()

  const [search, setSearch] = useState("");

  let selectedItemObjects = []
  let selectedItemId = 0

  function onSelect(id) {
    selectedItemId = id
  }

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  const [data, setData] = useState(null);

  useEffect(() => { dispatch(showSpinner(!data)) }, [data]);

  useEffect(() => {
    if (!data) {
      execute("GET", `${endpoint}`).then((response) => {
        setData(response);
      });
    }
  }, [execute, data])

  let body = <ProgressBar animated now={100} />

  if (error) {
    body = <Alert variant="danger">Error: {error.message}</Alert>
  } else {
    if (data && data.status === 200) {
      selectedItemObjects = data.data
      body = <Form onChange={(e) => onSelect(e.target.value)}>
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
    } else if (data && data.status !== 200) {
      dispatch(toast({header: data.error, body: data.message}))
      body = <Alert variant="danger">{ErrorMessage(data.message)}</Alert>
    }
  }

  function reset() {
    setShow(false)
    setSearch("")
  }

  function updateParent() {
    const updateItemObject = {}
    if (selectedItemId === "-1") {
      updateItemObject[updateIdField] = null
      updateItemObject[updateObjectField] = null
      updateItem(updateItemObject)
    } else {
      updateItemObject[updateIdField] = Number(selectedItemObjects[selectedItemId].id)
      updateItemObject[updateObjectField] = selectedItemObjects[selectedItemId]
      updateItem(updateItemObject)
    }
    setShow(false)
  }

  function getRenderRow(item, index) {
    return (search === "" || inSearchField(search, columns, item) || `${item.id}` === selectedItemId) && !(checkCircle === true && itemId === item.id) ?
      <tr key={index}>
        <td style={{ width: "0.5em" }}><Form.Check name="itemSelect" type="radio" aria-label={item.id} reverse value={index} defaultChecked={initialSelectedItem === item.id ? true : false} /></td>
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
