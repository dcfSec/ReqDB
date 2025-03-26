import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import SelectParentModal from "../SelectParentModal";
import { Item as Requirement } from "../../../types/API/Requirements";
import SelectMany from "../SelectManyModal";

type Props = {
  newItem: Requirement
  updateNewItem: (a: object) => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function RequirementAddListRow({ newItem, updateNewItem }: Props) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);
  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="key" placeholder="New Requirement key" value={newItem.key} onChange={e => { updateNewItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" placeholder="New Requirement name" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control as="textarea" rows={3} id="description" placeholder="New Requirement description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true)
      }}>{newItem.parent ? newItem.parent.key : "Parent"}</Button></td>
            <td><Button variant="primary" onClick={() => {
        setShowUpdateMany2Many(true)
      }}>Set</Button></td>
      <td></td>
      <td><Form.Check  type="switch" id="visible" defaultChecked={true} onChange={e => { updateNewItem({ visible: e.target.value }) }} /></td>
      {showUpdateMany2Many ? <SelectMany
        humanKey={newItem.key}
        show={showUpdateMany2Many}
        setShow={setShowUpdateMany2Many}
        initialSelectedItems={newItem.tags}
        endpoint="tags"
        columns={["name"]}
        updateKey={"tags"}
        updateItem={updateNewItem}
        name="tag"
      ></SelectMany> : null}
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
    </>
  );
}
