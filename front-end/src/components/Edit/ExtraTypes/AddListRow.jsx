import { useContext, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { LoadingSpinnerContext, NotificationToastContext } from "../../Providers";
import { ErrorMessage } from '../../MiniComponents'
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: blankItem, humanKey, endpoint, addItemToList
 * @returns A table row to add an item
 */
export default function AddListRow({ blankItem, humanKey, endpoint, addItemToList }) {

  const { setNotificationToastHandler } = useContext(NotificationToastContext)
  const { setShowSpinner } = useContext(LoadingSpinnerContext)

  const [newItem, setNewItem] = useState(blankItem);

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
      <td><Form.Control type="text" id="name" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td>
        <Form.Select id="extratype" aria-label="ExtraType type" defaultValue={newItem.extraType} onChange={e => { updateNewItem({ extraType: e.target.value }) }}>
          <option>Select the type</option>
          <option value="1">Plaintext</option>
          <option value="2">Markdown</option>
          <option value="3">Badges</option>
        </Form.Select>
      </td>
      <td></td>
      <td><Button variant="success" onClick={() => addItem()}>Add</Button></td>
    </tr>
  );
}
