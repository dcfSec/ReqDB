import { useContext, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { LoadingSpinnerContext, NotificationToastContext } from "../../Providers";
import { ErrorMessage } from '../../MiniComponents'
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: blankItem, humanKey, endpoint, addItemToList
 * @returns A table row to add an item
 */
export default function AddListRow({ blankItem, humanKey, endpoint, addItemToList, updateParent }) {

  const { setNotificationToastHandler } = useContext(NotificationToastContext)
  const { setShowSpinner } = useContext(LoadingSpinnerContext)

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
    execute("POST", `${endpoint}`, newItem).then(
      (response) => {
        if (response.status === 200) {
          addItemToList(response.data)
          setNotificationToastHandler([`Item created`, `Item "${response.data[humanKey]}" created.`, true])
          setNewItem(blankItem)
        } else {
          setNotificationToastHandler([response.error, ErrorMessage(response.message), true])
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
    const tempItem = { ...newItem, ...properties }
    setNewItem(tempItem)
  }

  return (
    <tr>
      <td></td>
      <td><Form.Control type="text" id="name" placeholder="New Tag name" value={newItem.name} onChange={e => { updateNewItem({ name: e.target.value }) }} /></td>
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
