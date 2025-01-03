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

import { Item as Catalogue } from '../../types/API/Catalogues';
import { Item as Extra } from '../../types/API/Extras';
import { Type } from '../../types/API/Extras';
import { Item as Requirement } from "../../types/API/Requirements";
import { Item as Tag } from "../../types/API/Tags";
import { Item as Topic } from "../../types/API/Topics";

type Props = {
  index: number;
  endpoint: string;
  needCascade: boolean;
  originalItem: Catalogue | Extra | Type | Requirement | Tag | Topic;
  humanKey: string;
  search: string;
  searchFields: Array<string>;
  editPageName: string;
}
/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, endpoint, originalItem, humanKey, search, searchFields, editPageName
 * @returns Table row for editing an object
 */
export default function EditListRow({ index, endpoint, needCascade, originalItem, humanKey, search, searchFields, editPageName }: Props) {
  const dispatch = useDispatch()

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);
  const [cascade, setCascade] = useState(false);

  const [edit, setEdit] = useState(false);

  const [item, setItem] = useState(originalItem);

  function resetTempItem() {
    setItem(originalItem)
  }

  function updateTempItem(properties: object) {
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
    const parameters = []
    if (force) {
      parameters.push("force")
      if (cascade) {
        parameters.push("cascade")
      }
    }
    execute("DELETE", `${endpoint}/${originalItem.id}?${parameters.join("&")}`, null, false).then(
      (response) => {
        if (response.status === 204) {
          setEdit(false)
          setShowDeleteModal(false)
          dispatch(toast({ header: "Item successfully deleted", body: `Item "${originalItem[humanKey]}" deleted.` }))
          dispatch(removeItem(index))
        } else {
          response.json().then((r: {error: string, message: string}) => {
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
    const deleteModal = <DeleteConfirmationModal show={showDeleteModal} item={String(item[humanKey])} onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()} onForceChange={e => setForce(e)} force={force} needCascade={needCascade} onCascadeChange={e => setCascade(e)} />
    const buttons = <EditButtons saveItem={saveItem} edit={edit} setEdit={setEdit} resetTempItem={resetTempItem} setShowDeleteModal={setShowDeleteModal} />

    switch (editPageName) {
      case "Catalogues":
        row = <CatalogueEditListRow buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item as Catalogue} />
        break;
      case "ExtraEntries":
        row = <ExtraEntryEditListRow buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item as Extra} />
        break;
      case "ExtraTypes":
        row = <ExtraTypeEditListRow buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item as Type} />
        break;
      case "Requirements":
        row = <RequirementEditListRow buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item as Requirement} />
        break;
      case "Tags":
        row = <TagEditListRow buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item as Tag} />
        break;
      case "Topics":
        row = <TopicEditListRow buttons={buttons} updateTempItem={updateTempItem} edit={edit} item={item as Topic} />
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
