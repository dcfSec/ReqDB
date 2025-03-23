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

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="title" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => { setShowUpdateMany2Many(true) }}>Set elements</Button></td>
      {showUpdateMany2Many ? <SelectMany
          humanKey={newItem.title}
          show={showUpdateMany2Many}
          setShow={setShowUpdateMany2Many}
          initialSelectedItems={newItem.topics}
          endpoint="topics"
          columns={["key", "title"]}
          updateKey={"topics"}
          updateItem={updateNewItem}
          name="topic"
        ></SelectMany> : null}
    </>
  );
}
