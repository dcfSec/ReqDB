import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import SelectMany from "../SelectManyModal";
import { Item as Catalogue } from '../../../types/API/Catalogues';


type Props = {
  newItem: Catalogue;
  updateNewItem: (a: object) => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem
 * @returns A table row to add an item
 */
export function CatalogueAddListRow({ newItem, updateNewItem }: Props) {

  const [showUpdateMany2ManyElements, setShowUpdateMany2ManyElements] = useState(false);
  const [showUpdateMany2ManyTags, setShowUpdateMany2ManyTags] = useState(false);

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="key" value={newItem.key} onChange={e => { updateNewItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowUpdateMany2ManyElements(true)
      }}>Set elements</Button></td>
      <td><Button variant="primary" onClick={() => {
        setShowUpdateMany2ManyTags(true)
      }}>Set</Button></td>
      {showUpdateMany2ManyElements ? <SelectMany
        humanKey={newItem.title}
        show={showUpdateMany2ManyElements}
        setShow={setShowUpdateMany2ManyElements}
        initialSelectedItems={newItem.topics}
        endpoint="topics"
        columns={["key", "title"]}
        updateKey={"topics"}
        updateItem={updateNewItem}
        name="topic"
      ></SelectMany> : null}
      {showUpdateMany2ManyTags ? <SelectMany
        humanKey={newItem.title}
        show={showUpdateMany2ManyTags}
        setShow={setShowUpdateMany2ManyTags}
        initialSelectedItems={newItem.tags}
        endpoint="tags"
        columns={["name"]}
        updateKey={"tags"}
        updateItem={updateNewItem}
        name="tag"
      ></SelectMany> : null}
    </>
  );
}
