import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import SelectParentModal from "../SelectParentModal";


/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function ExtraEntryAddListRow({ newItem, updateNewItem, postItem }) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);
  const [showSelectExtraModal, setShowSelectExtraModal] = useState(false);

  return (
    <tr>
      <td></td>
      <td><Form.Control as="textarea" rows={3} id="content" placeholder="New content" value={newItem.content} onChange={e => { updateNewItem({ content: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectExtraModal(true)
      }}>{newItem.extraType ? newItem.extraType.title : "ExtraType"}</Button></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true)
      }}>{newItem.requirement ? newItem.requirement.key : "Requirement"}</Button></td>
      <td><Button variant="success" onClick={() => postItem()}>Add</Button></td>
      {showSelectParentModal ? <SelectParentModal id="parent"
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={newItem.parentId}
        endpoint={"requirements"}
        updateItem={updateNewItem}
        updateIdField={"requirementId"}
        updateObjectField={"requirement"}
        checkCircle={false}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
      {showSelectExtraModal ? <SelectParentModal id="extra"
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectExtraModal}
        setShow={setShowSelectExtraModal}
        initialSelectedItem={newItem.parentId}
        endpoint={"extraTypes"}
        updateItem={updateNewItem}
        updateIdField={"extraTypeId"}
        updateObjectField={"extraType"}
        checkCircle={false}
        columns={["title"]}
      ></SelectParentModal> : null}
    </tr>
  );
}
