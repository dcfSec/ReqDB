import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { useState } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import SelectParentModal from "../SelectParentModal";


/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, humanKey, buttons, updateTempItem, edit, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem
 * @returns Table row for editing an object
 */
export function ExtraEntryEditListRow({ index, item, humanKey, buttons, updateTempItem, edit, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem }) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);
  const [showSelectExtraModal, setShowSelectExtraModal] = useState(false);

    return (
      <tr>
        <td>{item.id}</td>
        <td><Form.Control as="textarea" disabled={!edit} rows={3} id="content" value={item.content} onChange={e => { updateTempItem({ content: e.target.value }) }} /></td>
        <td><Button variant="primary" disabled={!edit} onClick={() => {
          setShowSelectExtraModal(true)
        }}>{item.extraType ? item.extraType.title : "ExtraType"}</Button></td>
        <td><Button variant="primary" disabled={!edit} onClick={() => {
          setShowSelectParentModal(true)
        }}>{item.requirement ? item.requirement.key : "Requirement"}</Button></td>
        <td>{buttons}</td>
        {showSelectParentModal ? <SelectParentModal id="parent"
          itemId={item.id}
          humanKey={item.title}
          show={showSelectParentModal}
          setShow={setShowSelectParentModal}
          initialSelectedItem={item.parentId}
          endpoint={"requirements"}
          updateItem={updateTempItem}
          updateIdField={"requirementId"}
          updateObjectField={"requirement"}
          checkCircle={false}
          columns={["key", "title"]}
        ></SelectParentModal> : null}
        {showSelectExtraModal ? <SelectParentModal id="extra"
          itemId={item.id}
          humanKey={item.id}
          show={showSelectExtraModal}
          setShow={setShowSelectExtraModal}
          initialSelectedItem={item.extraTypeId}
          endpoint={"extraTypes"}
          updateItem={updateTempItem}
          updateIdField={"extraTypeId"}
          updateObjectField={"extraType"}
          checkCircle={false}
          columns={["title"]}
        ></SelectParentModal> : null}
        {showDeleteModal ? <DeleteConfirmationModal
          show={showDeleteModal}
          item={item[humanKey]}
          onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()}
          onForceChange={e => setForce(e)}
        ></DeleteConfirmationModal> : null}
      </tr>
    );
}
