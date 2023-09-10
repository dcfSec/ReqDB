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

  const { execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

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
        <td><Form.Control type="text" id="key" placeholder="New Topic key" value={newItem.key} onChange={e => { updateNewItem({key: e.target.value}) }} /></td>
        <td><Form.Control type="text" id="title" placeholder="New Topic name" value={newItem.title} onChange={e => { updateNewItem({title: e.target.value}) }} /></td>
        <td><Form.Control type="text" id="description" placeholder="New Topic description" value={newItem.description} onChange={e => { updateNewItem({description: e.target.value}) }} /></td>
        <td><Button variant="primary" onClick={() => {
          setShowSelectParentModal(true) }}>{newItem.parent ? newItem.parent.key : "Parent"}</Button></td>
        <td></td>
      <td><Button variant="success" onClick={() => addItem()}>Add</Button></td>
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
