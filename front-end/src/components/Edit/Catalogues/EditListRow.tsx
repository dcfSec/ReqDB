import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { useState } from "react";
import SelectMany from "../SelectManyModal";
import { Item } from '../../../types/API/Catalogues';


type Props = {
  item: Item
  updateTempItem: (a: object) => void;
  edit: boolean
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function CatalogueEditListRow({ item, updateTempItem, edit }: Props) {

  const [showUpdateMany2ManyElements, setShowUpdateMany2ManyElements] = useState(false);
  const [showUpdateMany2ManyTags, setShowUpdateMany2ManyTags] = useState(false);

  return (
    <>
      <td>{item.id}</td>
      <td><Form.Control disabled={!edit} type="text" id="key" value={item.key} onChange={e => { updateTempItem({ key: e.target.value }) }} /></td>
      <td><Form.Control disabled={!edit} type="text" id="title" value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
      <td><Form.Control disabled={!edit} type="text" id="description" value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
      <td><Button disabled={!edit} variant="primary" onClick={() => {
        setShowUpdateMany2ManyElements(true)
      }}>Set elements</Button></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowUpdateMany2ManyTags(true)
      }}>Set</Button></td>
      {showUpdateMany2ManyElements ? <SelectMany
        humanKey={item.title}
        show={showUpdateMany2ManyElements}
        setShow={setShowUpdateMany2ManyElements}
        initialSelectedItems={item.topics}
        endpoint="topics"
        columns={["key", "title"]}
        updateKey={"topics"}
        updateItem={updateTempItem}
        name="topic"
      ></SelectMany> : null}
      {showUpdateMany2ManyTags ? <SelectMany
        humanKey={item.title}
        show={showUpdateMany2ManyTags}
        setShow={setShowUpdateMany2ManyTags}
        initialSelectedItems={item.tags}
        endpoint="tags"
        columns={["name"]}
        updateKey={"tags"}
        updateItem={updateTempItem}
        name="tag"
      ></SelectMany> : null}
    </>
  );
}
