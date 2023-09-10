import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField } from '../MiniComponents';
import { Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import FilterTopicEntry from './FilterTopicEntry';

export default function FilterTopicsModal({ show, setShow, topic, setFilteredTopics, filteredTopics }) {

  const [search, setSearch] = useState("");

  function reset() {
    setShow(false)
    setSearch("")
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
          Select Topic Filter
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Container>
        <Row>
          <Col><SearchField title="topic" search={search} onSearch={setSearch}></SearchField></Col>
        </Row>
        <Row>
          <FilterTopicEntry topic={topic} filteredTopics={filteredTopics} setFilteredTopics={setFilteredTopics} search={search} />
        </Row>
      </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => reset()}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}