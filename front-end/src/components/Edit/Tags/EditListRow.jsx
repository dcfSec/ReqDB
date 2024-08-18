import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import SelectMany from "../SelectManyModal";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal";

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function TagEditListRow({ index, item, buttons, updateTempItem, edit }) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);

  return (
    <tr>
      <td>{item.id}</td>
      <td><Form.Control type="text" id="name" disabled={!edit} value={item.name} onChange={e => { updateTempItem({ name: e.target.value }) }} /></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowUpdateMany2Many(true)
      }}>Set</Button></td>
      <td>{buttons}</td>
      {showUpdateMany2Many ? <SelectMany
        humanKey={item.name}
        show={showUpdateMany2Many}
        setShow={setShowUpdateMany2Many}
        initialSelectedItems={item.requirement}
        endpoint="requirements"
        columns={["key", "title"]}
        updateKey={"requirement"}
        updateItem={updateTempItem}
        name="requirement"
      ></SelectMany> : null}
    </tr>
  );
}
