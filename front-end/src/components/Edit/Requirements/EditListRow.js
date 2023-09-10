import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { inSearchField } from "../../MiniComponents";
import SelectMany from "../SelectManyModal";
import { useContext, useState } from "react";
import { API, UserContext, handleErrorMessage } from "../../../static";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";


export default function EditListRow({ index, endpoint, originalItem, humanKey, deleteItemInList, search, searchFields }) {

  const { setNotificationToastHandler } = useContext(UserContext)
  const { setShowSpinner } = useContext(UserContext)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);

  const [edit, setEdit] = useState(false);
  
  const [item, setItem] = useState(originalItem);

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);
  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  function resetTempItem() {
    setItem(originalItem)
  }

  function updateTempItem(properties) {
    const tempItem = {...item, ...properties}
    setItem(tempItem)
  }

  const { execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });
  
  function saveItem() {
    execute("PUT", `${API}/${endpoint}/${originalItem.id}?minimal`, item).then(
      (response) => {
        if (response.status === 200) {
          setItem(response.data)
          setEdit(false)
          setItem(response.data)
          setNotificationToastHandler([<>Item <code>{response.data[humanKey]}</code> edited</>, "Item successfully edited", true])
        } else {
          setNotificationToastHandler([response.data.error, handleErrorMessage(response.data.message), true])
        }
        setShowSpinner(false)
      },
      (error) => {
        setNotificationToastHandler(["UnhandledError", error.message, true])
        setShowSpinner(false)
      }
    )
  }

  function handleDeleteItem() {
    let parameters = []
    if (force) {
      parameters.push("force")
    }
    execute("DELETE", `${API}/${endpoint}/${originalItem.id}?${parameters.join("&")}`, null, false).then(
      (response) => {
        if (response.status === 204) {
          setEdit(false)
          setShowDeleteModal(false)
          setNotificationToastHandler([<>Item <code>{originalItem[humanKey]}</code> deleted</>, "Item successfully deleted", true])
          deleteItemInList(index)
          setItem(null)
        } else {
          response.json().then((r) => {
            setNotificationToastHandler([r.data.error, handleErrorMessage(r.data.message), true])
          }
          );
        }
        setShowSpinner(false)
      },
      (error) => {
        setNotificationToastHandler(["UnhandledError", error.message, true])
        setShowSpinner(false)
      }
    )
  }

  let buttons = <><Button variant="success" onClick={() => setEdit(true)}>Edit</Button>{' '}<Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button></>
  if (edit) {
    buttons = <><Button variant="success" onClick={() => saveItem()}>Save</Button>{' '}<Button variant="danger" onClick={() => { setEdit(false); resetTempItem() }}>Cancel</Button></>
  }

  if (originalItem && inSearchField(search, searchFields, item)) {
    return (
      <tr>
          <td>{originalItem.id}</td>
          <td><Form.Control type="text" id="key" disabled={!edit} value={item.key}  onChange={e => { updateTempItem({key: e.target.value}) }} /></td>
          <td><Form.Control type="text" id="title" disabled={!edit} value={item.title}  onChange={e => { updateTempItem({title: e.target.value}) }} /></td>
          <td><Form.Control  as="textarea" rows={3} id="description" disabled={!edit} value={item.description} onChange={e => { updateTempItem({description: e.target.value}) }} /></td>
          <td><Button variant="primary" disabled={!edit} onClick={() => {
            setShowSelectParentModal(true) }}>{item.parent ? item.parent.key : "None"}</Button></td>
          <td><Button variant="primary" disabled={!edit} onClick={() => {
            setShowUpdateMany2Many(true) }}>Set</Button></td>
          <td><Button variant="primary" disabled={!edit}>Show</Button></td>
          <td>{buttons}</td>
          {showUpdateMany2Many ?<SelectMany
            humanKey={item.key}
            show={showUpdateMany2Many}
            setShow={setShowUpdateMany2Many}
            initialSelectedItems={item.tags}
            endpoint="tags"
            columns={["name"]}
            updateKey={"tags"}
            updateItem={updateTempItem}
          ></SelectMany> : null}
          { showDeleteModal ? <DeleteConfirmationModal
            show={showDeleteModal}
            item={item[humanKey]}
            onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()}
            onForceChange={e => setForce(e)}
          ></DeleteConfirmationModal> : null }
          { showSelectParentModal ?
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
}
