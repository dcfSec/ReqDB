import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { ErrorMessage } from '../../MiniComponents'
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";

import { useDispatch } from 'react-redux'
import { showSpinner } from "../../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../../stateSlices/NotificationToastSlice";

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function TopicAddListRow({ newItem, updateNewItem, postItem }) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <tr>
      <td></td>
      <td><Form.Control type="text" id="key" placeholder="New Topic key" value={newItem.key} onChange={e => { updateNewItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" placeholder="New Topic name" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" placeholder="New Topic description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true)
      }}>{newItem.parent ? newItem.parent.key : "Parent"}</Button></td>
      <td></td>
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
        checkCircle={true}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
    </tr>
  );
}
