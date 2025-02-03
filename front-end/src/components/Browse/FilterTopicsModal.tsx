import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { SearchField } from '../MiniComponents';
import { Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import FilterTopicEntry from './FilterTopicEntry';
import { useAppSelector } from '../../hooks';
import { Item } from '../../types/API/Topics';


type Props = {
  show: boolean;
  setShow: (a: boolean) => void;
}
/**
 * Component for the filter modal for topics in the brows view
 * 
 * @param {object} param0 Props for this component: show, setShow, topics, setFilteredTopics, filteredTopics
 * @returns Returns a modal for filtering topics in the browse view
 */
export default function FilterTopicsModal({ show, setShow }: Props) {

  const [search, setSearch] = useState("");

  const data = useAppSelector(state => state.browse.data)
  let topics: Item[] = []
  if (data !== null) {
    topics = data.topics
  }

  function reset() {
    setShow(false)
    setSearch("")
  }

  const all = {
    id: 0,
    title: "All",
    children: topics,
    key: ""
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
            <Col><SearchField title="topic" onSearch={setSearch}></SearchField></Col>
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
