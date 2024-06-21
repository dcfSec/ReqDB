import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { inSearchField } from "../../MiniComponents";
import { useContext, useState } from "react";
import { LoadingSpinnerContext, NotificationToastContext } from "../../Providers";
import { ErrorMessage } from '../../MiniComponents'
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, endpoint, originalItem, humanKey, deleteItemInList, search, searchFields
 * @returns Table row for editing an object
 */
export default function EditListRow({ index, endpoint, originalItem, humanKey, deleteItemInList, search, searchFields }) {

  const { setNotificationToastHandler } = useContext(NotificationToastContext)
  const { setShowSpinner } = useContext(LoadingSpinnerContext)

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);

  const [edit, setEdit] = useState(false);

  const [item, setItem] = useState(originalItem);

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);
  const [showSelectExtraModal, setShowSelectExtraModal] = useState(false);

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
    execute("PUT", `${endpoint}/${originalItem.id}?minimal`, item).then(
      (response) => {
        if (response.status === 200) {
          setItem(response.data)
          setEdit(false)
          setItem(response.data)
          setNotificationToastHandler([<>Item <code>{response.data[humanKey]}</code> edited</>, "Item successfully edited", true])
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

  function handleDeleteItem() {
    let parameters = []
    if (force) {
      parameters.push("force")
    }
    execute("DELETE", `${endpoint}/${originalItem.id}?${parameters.join("&")}`, null, false).then(
      (response) => {
        if (response.status === 204) {
          setEdit(false)
          setShowDeleteModal(false)
          setNotificationToastHandler([<>Item <code>{originalItem[humanKey]}</code> deleted</>, "Item successfully deleted", true])
          deleteItemInList(index)
          setItem(null)
        } else {
          response.json().then((r) => {
            setNotificationToastHandler([r.error, ErrorMessage(r.message), true])
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
}
