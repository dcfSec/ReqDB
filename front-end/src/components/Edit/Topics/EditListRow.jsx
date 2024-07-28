import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import SelectMany from "../SelectManyModal";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal";
import SelectParentModal from "../SelectParentModal";

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, humanKey, buttons, updateTempItem, edit, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem
 * @returns Table row for editing an object
 */
export function TopicEditListRow({ index, item, humanKey, buttons, updateTempItem, edit, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem }) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);
  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <tr>
      <td>{item.id}</td>
      <td><Form.Control type="text" id="key" disabled={!edit} value={item.key} onChange={e => { updateTempItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" disabled={!edit} value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" disabled={!edit} value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowSelectParentModal(true)
      }}>{item.parent ? item.parent.key : "None"}</Button></td>
      <td></td>
      <td>{buttons}</td>
      {showUpdateMany2Many ? <SelectMany
        humanKey={item.name}
        show={showUpdateMany2Many}
        setShow={setShowUpdateMany2Many}
        initialSelectedItems={item.requirement}
        endpoint="topics"
        columns={["key", "title"]}
        updateKey={"requirement"}
        updateItem={updateTempItem}
      ></SelectMany> : null}
      {showDeleteModal ? <DeleteConfirmationModal
        show={showDeleteModal}
        item={item[humanKey]}
        onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()}
        onForceChange={e => setForce(e)}
      ></DeleteConfirmationModal> : null}
      {showSelectParentModal ?
        <SelectParentModal
          humanKey={item.title}
          initialSelectedItem={item.parentId}
          itemId={item.id}
          show={showSelectParentModal}
          setShow={setShowSelectParentModal}
          endpoint="topics"
          updateIdField="parentId"
          updateObjectField="parent"
          checkCircle={true}
          columns={["key", "title"]}
          updateItem={updateTempItem}
        ></SelectParentModal> : null}
    </tr>
  );
}
