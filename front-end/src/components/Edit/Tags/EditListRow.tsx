import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import SelectMany from "../SelectManyModal";
import { useState } from "react";
import { Item } from '../../../types/API/Tags';


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
export function TagEditListRow({ item, updateTempItem, edit }: Props) {

  const [showUpdateMany2ManyRequirements, setShowUpdateMany2ManyRequirements] = useState(false);
  const [showUpdateMany2ManyCatalogues, setShowUpdateMany2ManyCatalogues] = useState(false);

  return (
    <>
      <td>{item.id}</td>
      <td><Form.Control type="text" id="name" disabled={!edit} value={item.name} onChange={e => { updateTempItem({ name: e.target.value }) }} /></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowUpdateMany2ManyRequirements(true)
      }}>Set</Button></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowUpdateMany2ManyCatalogues(true)
      }}>Set</Button></td>
      {showUpdateMany2ManyRequirements ? <SelectMany
        humanKey={item.name}
        show={showUpdateMany2ManyRequirements}
        setShow={setShowUpdateMany2ManyRequirements}
        initialSelectedItems={item.requirements}
        endpoint="requirements"
        columns={["key", "title"]}
        updateKey={"requirements"}
        updateItem={updateTempItem}
        name="requirement"
      ></SelectMany> : null}
      {showUpdateMany2ManyCatalogues ? <SelectMany
        humanKey={item.name}
        show={showUpdateMany2ManyCatalogues}
        setShow={setShowUpdateMany2ManyCatalogues}
        initialSelectedItems={item.catalogues}
        endpoint="catalogues"
        columns={["title"]}
        updateKey={"catalogues"}
        updateItem={updateTempItem}
        name="catalogue"
      ></SelectMany> : null}
    </>
  );
}
