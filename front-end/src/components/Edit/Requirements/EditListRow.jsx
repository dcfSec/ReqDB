import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import SelectMany from "../SelectManyModal";
import { useState } from "react";
import SelectParentModal from "../SelectParentModal";

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function RequirementEditListRow({ index, item, buttons, updateTempItem, edit }) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);
  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <tr>
      <td>{item.id}</td>
      <td><Form.Control type="text" id="key" disabled={!edit} value={item.key} onChange={e => { updateTempItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" disabled={!edit} value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
      <td><Form.Control as="textarea" rows={3} id="description" disabled={!edit} value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowSelectParentModal(true)
      }}>{item.parent ? item.parent.key : "None"}</Button></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowUpdateMany2Many(true)
      }}>Set</Button></td>
      <td><Button variant="primary" disabled={!edit}>Show</Button></td>
      <td><Form.Check type="switch" id="visible" disabled={!edit} defaultChecked={item.visible} onChange={e => { updateTempItem({ visible: e.target.value }) }} /></td>
      <td>{buttons}</td>
      {showUpdateMany2Many ? <SelectMany
        humanKey={item.key}
        show={showUpdateMany2Many}
        setShow={setShowUpdateMany2Many}
        initialSelectedItems={item.tags}
        endpoint="tags"
        columns={["name"]}
        updateKey={"tags"}
        updateItem={updateTempItem}
        name="tag"
      ></SelectMany> : null}
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
          checkCircle={false}
          columns={["key", "title"]}
          updateItem={updateTempItem}
        ></SelectParentModal> : null}
    </tr>
  );
}
