import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField, inSearchField } from '../MiniComponents';
import { Alert, Col, Container, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { API, UserContext, handleErrorMessage } from '../../static';
import useFetchWithMsal from '../../hooks/useFetchWithMsal';
import { protectedResources } from '../../authConfig';

/**
 * Component for a modal to select many elements to link to this object
 * 
 * @param {object} props Props for this component: humanKey, show, setShow, initialSelectedItems, endpoint, columns, updateKey, updateItem
 * @returns Returns a modal to select many
 */
export default function SelectMany({ humanKey, show, setShow, initialSelectedItems = [], endpoint, columns, updateKey, updateItem }) {

  const { setNotificationToastHandler } = useContext(UserContext)
  const { setShowSpinner } = useContext(UserContext)
  const [search, setSearch] = useState("");

  const initialSelectedItemIds = initialSelectedItems.map((item) => (item.id))
  const [selectedItemIds, setSelectedItemIds] = useState(initialSelectedItemIds);

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
      body = <Form>
        <Table responsive>
          <thead>
            <tr>
              <th style={{ width: "0.5em" }}></th>
              {columns.map((item, index) => (<th key={index}>{item}</th>))}
            </tr>
          </thead>
          <tbody>
            {data.data.map((item, index) => (getRenderRow(item, index)))}
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

  function handleCheckboxChange(changeEvent) {
    const { value, checked } = changeEvent.target;

    if (checked === true && !selectedItemIds.includes(Number(value))) {
      setSelectedItemIds([...selectedItemIds, ...[Number(value)]])
    } else {
      const tempItem = selectedItemIds.filter(function (v) { return v !== Number(value); });
      setSelectedItemIds([...tempItem]);

    }
  };

  function updateParent() {
    const updateItemObject = {}
    const selectedItemObjects = selectedItemIds.map((key) => ({ id: key }))
    updateItemObject[updateKey] = [...selectedItemObjects]
    updateItem(updateItemObject)
    setShow(false)
  }

  function getRenderRow(item, index) {
    return (search === "" || inSearchField(search, ["title", "key"], item) || selectedItemIds.includes(item.id)) ?
      <tr key={index}>
        <td style={{ width: "0.5em" }}><Form.Check name={item.id} type="checkbox" aria-label={item.id} reverse value={item.id} onChange={handleCheckboxChange} defaultChecked={initialSelectedItemIds.includes(item.id) && selectedItemIds.includes(item.id) ? true : false} /></td>
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
          Add parent to <code>{humanKey}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col><SearchField title="parent" search={search} onSearch={setSearch}></SearchField></Col>
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
