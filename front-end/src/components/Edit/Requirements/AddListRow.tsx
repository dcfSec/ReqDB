import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import SelectParentModal from "../SelectParentModal";
import { Item as Requirement } from "../../../types/API/Requirements";

type Props = {
  newItem: Requirement
  updateNewItem: (a: object) => void;
  postItem: () => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function RequirementAddListRow({ newItem, updateNewItem, postItem }: Props) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <tr>
      <td></td>
      <td><Form.Control type="text" id="key" placeholder="New Requirement key" value={newItem.key} onChange={e => { updateNewItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" placeholder="New Requirement name" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control as="textarea" rows={3} id="description" placeholder="New Requirement description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true)
      }}>{newItem.parent ? newItem.parent.key : "Parent"}</Button></td>
      <td></td><td></td>
      <td><Form.Check  type="switch" id="visible" defaultChecked={true} onChange={e => { updateNewItem({ visible: e.target.value }) }} /></td>
      <td><Button variant="success" onClick={() => postItem()}>Add</Button></td>
      {showSelectParentModal ? <SelectParentModal
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={newItem.parentId}
        endpoint={"topics"}
        updateItem={updateNewItem}
        updateIdField={"parentId"}
        updateObjectField={"parent"}
        checkCircle={false}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
    </tr>
  );
}
