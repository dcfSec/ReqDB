import { useContext, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Button } from "react-bootstrap";
import { API, UserContext, handleErrorMessage } from "../../../static";
import SelectParentModal from "../SelectParentModal";
import useFetchWithMsal from "../../../hooks/useFetchWithMsal";
import { protectedResources } from "../../../authConfig";

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: blankItem, humanKey, endpoint, addItemToList
 * @returns A table row to add an item
 */
export default function AddListRow({ blankItem, humanKey, endpoint, addItemToList }) {

  const { setNotificationToastHandler } = useContext(UserContext)
  const { setShowSpinner } = useContext(UserContext)

  const [newItem, setNewItem] = useState(blankItem);

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);
  const [showSelectExtraModal, setShowSelectExtraModal] = useState(false);

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

  function updateNewItem(properties) {
    const tempItem = { ...newItem, ...properties }
    setNewItem(tempItem)
  }

  return (
    <tr>
      <td></td>
      <td><Form.Control as="textarea" rows={3} id="content" placeholder="New content" value={newItem.content} onChange={e => { updateNewItem({ content: e.target.value }) }} /></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectExtraModal(true)
      }}>{newItem.extraType ? newItem.extraType.title : "ExtraType"}</Button></td>
      <td><Button variant="primary" onClick={() => {
        setShowSelectParentModal(true)
      }}>{newItem.requirement ? newItem.requirement.key : "Requirement"}</Button></td>
      <td><Button variant="success" onClick={() => addItem()}>Add</Button></td>
      {showSelectParentModal ? <SelectParentModal id="parent"
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectParentModal}
        setShow={setShowSelectParentModal}
        initialSelectedItem={newItem.parentId}
        endpoint={"requirements"}
        updateItem={updateNewItem}
        updateIdField={"requirementId"}
        updateObjectField={"requirement"}
        checkCircle={false}
        columns={["key", "title"]}
      ></SelectParentModal> : null}
      {showSelectExtraModal ? <SelectParentModal id="extra"
        itemId={newItem.id}
        humanKey={newItem.title}
        show={showSelectExtraModal}
        setShow={setShowSelectExtraModal}
        initialSelectedItem={newItem.parentId}
        endpoint={"extraTypes"}
        updateItem={updateNewItem}
        updateIdField={"extraTypeId"}
        updateObjectField={"extraType"}
        checkCircle={false}
        columns={["title"]}
      ></SelectParentModal> : null}
    </tr>
  );
}
