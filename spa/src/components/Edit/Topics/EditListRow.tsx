import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import SelectMany from "../SelectManyModal";
import { useState } from "react";
import SelectParentModal from "../SelectParentModal";
import { Item } from '../../../types/API/Topics';


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
export function TopicEditListRow({ item, updateTempItem, edit }: Props) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);
  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  return (
    <>
      <td>{item.id}</td>
      <td><Form.Control type="text" id="key" disabled={!edit} value={item.key} onChange={e => { updateTempItem({ key: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="title" disabled={!edit} value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" disabled={!edit} value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
      <td><Button variant="primary" disabled={!edit} onClick={() => {
        setShowSelectParentModal(true)
      }}>{item.parent ? item.parent.key : "None"}</Button></td>
      <td></td>
      {showUpdateMany2Many ? <SelectMany
        humanKey={item.title}
        show={showUpdateMany2Many}
        setShow={setShowUpdateMany2Many}
        initialSelectedItems={item.requirements}
        endpoint="topics"
        columns={["key", "title"]}
        updateKey={"requirement"}
        updateItem={updateTempItem}
        name="topic"
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
          checkCircle={true}
          columns={["key", "title"]}
          updateItem={updateTempItem}
        ></SelectParentModal> : null}
    </>
  );
}
