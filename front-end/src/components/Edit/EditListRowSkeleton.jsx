import { inSearchField, EditButtons } from "../MiniComponents";
import { useState } from "react";
import useFetchWithMsal from "../../hooks/useFetchWithMsal";
import { protectedResources } from "../../authConfig";

import { useDispatch } from 'react-redux'
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { removeItem, updateItem } from "../../stateSlices/EditSlice";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

import { CatalogueEditListRow } from "./Catalogues/EditListRow"
import { ExtraEntryEditListRow } from "./ExtraEntries/EditListRow"
import { ExtraTypeEditListRow } from "./ExtraTypes/EditListRow"
import { RequirementEditListRow } from "./Requirements/EditListRow"
import { TagEditListRow } from "./Tags/EditListRow"
import { TopicEditListRow } from "./Topics/EditListRow"

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, endpoint, originalItem, humanKey, search, searchFields, editPageName
 * @returns Table row for editing an object
 */
export default function EditListRow({ index, endpoint, originalItem, humanKey, search, searchFields, editPageName }) {
  const dispatch = useDispatch()

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);

  const [edit, setEdit] = useState(false);

  const [item, setItem] = useState(originalItem);

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
    dispatch(toast({ header: "UnhandledError", body: error.message }))
    dispatch(showSpinner(false))
  }

  function saveItem() {
    execute("PUT", `${endpoint}/${originalItem.id}?minimal`, item).then(
      (response) => {
        if (response.status === 200) {
          setEdit(false)
          setItem(response.data)
          dispatch(updateItem({ index, item: response.data })) // Do we need to update the main list (unnecessary rerender)?
          dispatch(toast({ header: "Item successfully edited", body: `Item "${response.data[humanKey]}" edited` }))
        } else {
          dispatch(toast({ header: response.error, body: response.message }))
        }
        dispatch(showSpinner(false))
      },
      (error) => {
        dispatch(toast({ header: "UnhandledError", body: error.message }))
        dispatch(showSpinner(false))
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
          dispatch(toast({ header: "Item successfully deleted", body: `Item "${originalItem[humanKey]}" deleted.` }))
          dispatch(removeItem(index))
        } else {
          response.json().then((r) => {
            dispatch(toast({ header: r.error, body: r.message }))
          }
          );
        }
        dispatch(showSpinner(false))
      },
      (error) => {
        dispatch(toast({ header: "UnhandledError", body: error.message }))
        dispatch(showSpinner(false))
      }
    )
  }

  if (inSearchField(search, searchFields, item) || edit) {
    let row = <></>
    const deleteModal = <DeleteConfirmationModal show={showDeleteModal} item={item[humanKey]} onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()} onForceChange={e => setForce(e)} />
    const buttons = <EditButtons saveItem={saveItem} edit={edit} setEdit={setEdit} resetTempItem={resetTempItem} setShowDeleteModal={setShowDeleteModal} />

    switch (editPageName) {
      case "Catalogues":
        row = <CatalogueEditListRow originalItem={originalItem} buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item} />
        break;
      case "ExtraEntries":
        row = <ExtraEntryEditListRow originalItem={originalItem} buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item} />
        break;
      case "ExtraTypes":
        row = <ExtraTypeEditListRow originalItem={originalItem} buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item} />
        break;
      case "Requirements":
        row = <RequirementEditListRow originalItem={originalItem} buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item} />
        break;
      case "Tags":
        row = <TagEditListRow originalItem={originalItem} buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item} />
        break;
      case "Topics":
        row = <TopicEditListRow originalItem={originalItem} buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item} />
        break;
      default:
        row = <></>
        break;
    }
    return (
      <>
        {row}
        {deleteModal}
      </>
    )
  }
}
