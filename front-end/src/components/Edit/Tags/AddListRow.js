import { useContext, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { API, UserContext, handleErrorMessage } from "../../../static";
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";


export default function AddListRow({blankItem, humanKey, endpoint, addItemToList, updateParent}) {

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
      <td><Form.Control type="text" id="name" placeholder="New Tag name" value={newItem.name} onChange={e => { updateNewItem({name: e.target.value}) }} /></td>
      <td></td>
      <td><Button variant="success" onClick={() => addItem()}>Add</Button></td>
      {updateParent.needsParent && showSelectParentModal ? <SelectParentModal
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={newItem.parentId}
        endpoint={updateParent.endpoint}
        updateItem={updateNewItem}
        updateIdField={updateParent.updateIdField}
        updateObjectField={updateParent.updateObjectField}
        checkCircle={updateParent.checkCircle}
        columns={updateParent.columns}
      ></SelectParentModal> : null}
    </tr>
  );
}
