import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField, inSearchField, ErrorMessage } from '../MiniComponents';
import { Alert, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import useFetchWithMsal from '../../hooks/useFetchWithMsal';
import { protectedResources } from '../../authConfig';

import { useDispatch } from 'react-redux'
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import LoadingBar from '../LoadingBar';

/**
 * Component for a modal to select many elements to link to this object
 * 
 * @param {object} props Props for this component: humanKey, show, setShow, initialSelectedItems, endpoint, columns, updateKey, updateItem
 * @returns Returns a modal to select many
 */
export default function SelectMany({ humanKey, show, setShow, initialSelectedItems = [], endpoint, columns, updateKey, updateItem, name }) {
  const dispatch = useDispatch()

  const [search, setSearch] = useState("");

  const initialSelectedItemIds = initialSelectedItems.map((item) => (item.id))
  const [selectedItemIds, setSelectedItemIds] = useState(initialSelectedItemIds);

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

  let body = <LoadingBar />

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
      dispatch(toast({header: data.error, body: data.message}))
      body = <Alert variant="danger">{ErrorMessage(data.message)}</Alert>
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
          Add {name} to <code>{humanKey}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col><SearchField title={name} search={search} onSearch={setSearch}></SearchField></Col>
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
