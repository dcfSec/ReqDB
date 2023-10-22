import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { inSearchField } from "../../MiniComponents";
import SelectMany from "../SelectManyModal";
import { useContext, useState } from "react";
import { API, UserContext, handleErrorMessage } from "../../../static";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, endpoint, originalItem, humanKey, deleteItemInList, search, searchFields
 * @returns Table row for editing an object
 */
export default function EditListRow({ index, endpoint, originalItem, humanKey, deleteItemInList, search, searchFields }) {

  const { setNotificationToastHandler } = useContext(UserContext)
  const { setShowSpinner } = useContext(UserContext)

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);

  const [edit, setEdit] = useState(false);

  const [item, setItem] = useState(originalItem);

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);

  function resetTempItem() {
    setItem(originalItem)
  }

  function updateTempItem(properties) {
    const tempItem = { ...item, ...properties }
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
          setNotificationToastHandler([response.error, handleErrorMessage(response.message), true])
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
            setNotificationToastHandler([r.error, handleErrorMessage(r.message), true])
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
        <td><Form.Control type="text" id="name" disabled={!edit} value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
        <td><Form.Control type="text" id="description" disabled={!edit} value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
        <td>
          <Form.Select id="extratype" aria-label="ExtraType type" disabled={!edit} defaultValue={item.extraType} onChange={e => { updateTempItem({ extraType: e.target.value }) }}>
            <option value="1">Plaintext</option>
            <option value="2">Markdown</option>
            <option value="3">Badges</option>
          </Form.Select>
        </td>
        <td><Button variant="primary">Show</Button></td>
        <td>{buttons}</td>
        {showUpdateMany2Many ? <SelectMany
          humanKey={item.key}
          show={showUpdateMany2Many}
          setShow={setShowUpdateMany2Many}
          initialSelectedItems={item.tags}
          endpoint="tags"
          columns={["name"]}
          updateKey={"tags"}
          updateItem={updateTempItem}
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
}
