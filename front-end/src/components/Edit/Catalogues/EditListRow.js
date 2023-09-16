import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { inSearchField } from "../../MiniComponents";
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

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  function resetTempItem() {
    setItem(originalItem)
  }

  function updateTempItem(properties) {
    const tempItem = {...item, ...properties}
    setItem(tempItem)
  }

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  if (error) {
    setNotificationToastHandler(["UnhandledError", error.message, true])
    setShowSpinner(false)    
  }
  
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
        <td><Form.Control disabled={!edit} type="text" id="title" value={item.title} onChange={e => { updateTempItem({title: e.target.value}) }} /></td>
        <td><Form.Control disabled={!edit} type="text" id="description" value={item.description} onChange={e => { updateTempItem({description: e.target.value}) }} /></td>
        <td><Form.Control disabled={!edit} type="number" id="maxDepth" min="0" value={item.maxDepth} onChange={e => { updateTempItem({maxDepth: e.target.value}) }} /></td>
        <td><Button disabled={!edit} variant="primary" onClick={() => {
        setShowSelectParentModal(true) }}>{item.root ? item.rootObject.key : "Root Element"}</Button></td>
        <td>{buttons}</td>
        {showSelectParentModal ? <SelectParentModal id="parent"
        itemId={item.id}
        humanKey={item.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={item.parentId}
        endpoint={"topics"}
        updateItem={updateTempItem}
        updateIdField={"root"}
        updateObjectField={"rootObject"}
        checkCircle={false}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
        { showDeleteModal ? <DeleteConfirmationModal
        show={showDeleteModal}
        item={item[humanKey]}
        onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()}
        onForceChange={e => setForce(e)}
      ></DeleteConfirmationModal> : null }
      </tr>
    );
  }
}

