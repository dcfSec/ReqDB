import { useContext, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { API, UserContext, handleErrorMessage } from "../../../static";
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";


export default function AddListRow({blankItem, humanKey, endpoint, addItemToList}) {

  const { setNotificationToastHandler } = useContext(UserContext)
  const { setShowSpinner } = useContext(UserContext)

  const [newItem, setNewItem] = useState(blankItem);

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  if (error) {
    setNotificationToastHandler(["UnhandledError", error.message, true])
    setShowSpinner(false)    
  }

  function addItem() {
    execute("POST", `${API}/${endpoint}`, newItem).then(
      (response) => {
        if (response.status === 200) {
          addItemToList(response.data)
          setNotificationToastHandler([`Item created`, `Item "${response.data[humanKey]}" created.`, true])
          setNewItem(blankItem)
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

  function updateNewItem(properties) {
    const tempItem = {...newItem, ...properties}
    setNewItem(tempItem)
  }

  return (
    <tr>
      <td></td>
      <td><Form.Control type="text" id="title" value={newItem.title} onChange={e => { updateNewItem({title: e.target.value}) }} /></td>
      <td><Form.Control type="text" id="description" value={newItem.description} onChange={e => { updateNewItem({description: e.target.value}) }} /></td>
      <td><Form.Control type="number" id="maxDepth" min="0" value={newItem.maxDepth} onChange={e => { updateNewItem({maxDepth: e.target.value}) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true) }}>{newItem.root ? newItem.rootObject.key : "Root Element"}</Button></td>
      <td><Button variant="success" onClick={() => addItem()}>Add</Button></td>
      {showSelectParentModal ? <SelectParentModal id="parent"
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={newItem.parentId}
        endpoint={"topics"}
        updateItem={updateNewItem}
        updateIdField={"root"}
        updateObjectField={"rootObject"}
        checkCircle={false}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
    </tr>
  );
}
