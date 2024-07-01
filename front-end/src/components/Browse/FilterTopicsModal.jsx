import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField } from '../MiniComponents';
import { Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import FilterTopicEntry from './FilterTopicEntry';
import { useSelector, useDispatch } from 'react-redux'

/**
 * Component for the filter modal for topics in the brows view
 * 
 * @param {object} param0 Props for this component: show, setShow, topics, setFilteredTopics, filteredTopics
 * @returns Returns a modal for filtering topics in the browse view
 */
export default function FilterTopicsModal({ show, setShow }) {

  const [search, setSearch] = useState("");

  const topics = useSelector(state => state.browse.data).topics

  function reset() {
    setShow(false)
    setSearch("")
  }

  const all = {
    title: "All",
    children: topics
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
          Select Topic Filter
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col><SearchField title="topic" search={search} onSearch={setSearch}></SearchField></Col>
          </Row>
          <Row>
            <ul><FilterTopicEntry topic={all} search={search} root={true} /></ul>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => reset()}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
