import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import SelectParentModal from "../SelectParentModal";

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem, updateParent
 * @returns A table row to add an item
 */
export function TagAddListRow({ newItem, updateNewItem, postItem, updateParent }) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <tr>
      <td></td>
      <td><Form.Control type="text" id="name" placeholder="New Tag name" value={newItem.name} onChange={e => { updateNewItem({ name: e.target.value }) }} /></td>
      <td></td>
      <td><Button variant="success" onClick={() => postItem()}>Add</Button></td>
      {updateParent.needsParent && showSelectParentModal ? <SelectParentModal
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={newItem.parentId}
        endpoint={updateParent.endpoint}
        updateItem={updateNewItem}
        updateIdField={updateParent.updateIdField}
        updateObjectField={updateParent.updateObjectField}
        checkCircle={updateParent.checkCircle}
        columns={updateParent.columns}
      ></SelectParentModal> : null}
    </tr>
  );
}
