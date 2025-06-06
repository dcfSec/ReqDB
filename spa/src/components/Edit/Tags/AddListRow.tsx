import Form from 'react-bootstrap/Form';
import { Item as Tag } from "../../../types/API/Tags";
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import SelectMany from '../SelectManyModal';

type Props = {
  newItem: Tag
  updateNewItem: (a: object) => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function TagAddListRow({ newItem, updateNewItem }: Props) {

  const [showUpdateMany2ManyRequirements, setShowUpdateMany2ManyRequirements] = useState(false);
  const [showUpdateMany2ManyCatalogues, setShowUpdateMany2ManyCatalogues] = useState(false);

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="name" placeholder="New Tag name" value={newItem.name} onChange={e => { updateNewItem({ name: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowUpdateMany2ManyRequirements(true)
      }}>Set</Button></td>
      <td><Button variant="primary" onClick={() => {
        setShowUpdateMany2ManyCatalogues(true)
      }}>Set</Button></td>
      {showUpdateMany2ManyRequirements ? <SelectMany
        humanKey={newItem.name}
        show={showUpdateMany2ManyRequirements}
        setShow={setShowUpdateMany2ManyRequirements}
        initialSelectedItems={newItem.requirements}
        endpoint="requirements"
        columns={["key", "title"]}
        updateKey={"requirements"}
        updateItem={updateNewItem}
        name="requirement"
      ></SelectMany> : null}
      {showUpdateMany2ManyCatalogues ? <SelectMany
        humanKey={newItem.name}
        show={showUpdateMany2ManyCatalogues}
        setShow={setShowUpdateMany2ManyCatalogues}
        initialSelectedItems={newItem.catalogues}
        endpoint="catalogues"
        columns={["title"]}
        updateKey={"catalogues"}
        updateItem={updateNewItem}
        name="catalogue"
      ></SelectMany> : null}
    </>
  );
}
