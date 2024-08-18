import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal";
import SelectMany from "../SelectManyModal";

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, humanKey, buttons, updateTempItem, edit, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem
 * @returns Table row for editing an object
 */
export function CatalogueEditListRow({ index, item, humanKey, buttons, updateTempItem, edit, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem }) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);

    return (
      <tr>
        <td>{item.id}</td>
        <td><Form.Control disabled={!edit} type="text" id="title" value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
        <td><Form.Control disabled={!edit} type="text" id="description" value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
        <td><Button disabled={!edit} variant="primary" onClick={() => {
          setShowUpdateMany2Many(true)
        }}>Set elements</Button></td>
        <td>{buttons}</td>
        {showUpdateMany2Many ? <SelectMany
          humanKey={item.title}
          show={showUpdateMany2Many}
          setShow={setShowUpdateMany2Many}
          initialSelectedItems={item.topics}
          endpoint="topics"
          columns={["key", "title"]}
          updateKey={"topics"}
          updateItem={updateTempItem}
          name="topic"
        ></SelectMany> : null}
        {showDeleteModal ? <DeleteConfirmationModal
          show={showDeleteModal}
          item={item[humanKey]}
          onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()}
          onForceChange={e => setForce(e)}
        ></DeleteConfirmationModal> : null}
      </tr>
    );
}
