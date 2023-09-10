import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField, inSearchField } from '../MiniComponents';
import { Alert, Col, Container, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { API, UserContext, handleErrorMessage } from '../../static';
import useFetchWithMsal from '../../hooks/useFetchWithMsal';
import { protectedResources } from '../../authConfig';

export default function SelectParentModal(props) {
  const { itemId, humanKey, show, setShow, initialSelectedItem, updateItem, updateIdField, updateObjectField, checkCircle, endpoint, columns } = props

  const { setNotificationToastHandler } = useContext(UserContext)
  const { setShowSpinner } = useContext(UserContext)

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

  useEffect(() => { setShowSpinner(!data) }, [data]);

  useEffect(() => {
      if (!data) {
          execute("GET", `${API}/${endpoint}`).then((response) => {
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
          <th style={{width:"0.5em"}}></th>
          {columns.map((item, index) => (<th key={index}>{item}</th>))}
        </tr>
      </thead>
      <tbody>
      <tr><td style={{width:"0.5em"}}><Form.Check name="itemSelect" type="radio" aria-label="None" reverse value="-1" defaultChecked={initialSelectedItem === null ? true : false}/></td>
        {columns.map((column, cIndex) => (<td key={cIndex}>None</td>))}</tr>
      {selectedItemObjects.map((item, index) => (getRenderRow(item, index)))}
      </tbody>
    </Table>
    </Form>
    } else if (data && data.status !== 200) {
      setNotificationToastHandler([data.error, data.message, true])
      body = <Alert variant="danger">{handleErrorMessage(data.message)}</Alert>
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
      <td style={{width:"0.5em"}}><Form.Check name="itemSelect" type="radio" aria-label={item.id} reverse value={index} defaultChecked={initialSelectedItem === item.id ? true : false}/></td>
      {columns.map((column, cIndex) => (<td key={cIndex}>{item[column]}</td>))}
    </tr> 
      : null

  }

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      onHide={() => {reset()}}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Add {updateObjectField} to <code>{humanKey ? humanKey : "new item"}</code>
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
