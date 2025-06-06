import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import SelectParentModal from "../SelectParentModal";

import { Item as Topic } from "../../../types/API/Topics";

type Props = {
  newItem: Topic
  updateNewItem: (a: object) => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function TopicAddListRow({ newItem, updateNewItem }: Props) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="key" placeholder="New Topic key" value={newItem.key} onChange={e => { updateNewItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" placeholder="New Topic name" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" placeholder="New Topic description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true)
      }}>{newItem.parent ? newItem.parent.key : "Parent"}</Button></td>
      <td></td>
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
        checkCircle={true}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
    </>
  );
}
