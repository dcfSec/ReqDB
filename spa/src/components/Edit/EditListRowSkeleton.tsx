import { inSearchField, EditButtons } from "../MiniComponents";
import { useState } from "react";

import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { removeItem, toggleSelected, updateItem } from "../../stateSlices/EditSlice";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

import { CatalogueEditListRow } from "./Catalogues/EditListRow"
import { ExtraEntryEditListRow } from "./ExtraEntries/EditListRow"
import { ExtraTypeEditListRow } from "./ExtraTypes/EditListRow"
import { RequirementEditListRow } from "./Requirements/EditListRow"
import { TagEditListRow } from "./Tags/EditListRow"
import { TopicEditListRow } from "./Topics/EditListRow"
import { ServiceUserEditListRow } from "./ServiceUser/EditListRow";
import { ConfigurationEditListRow } from "./SystemConfiguration/EditListRow";


import { Item as Catalogue } from '../../types/API/Catalogues';
import { Item as Extra } from '../../types/API/Extras';
import { Type } from '../../types/API/Extras';
import { Item as Requirement } from "../../types/API/Requirements";
import { Item as Tag } from "../../types/API/Tags";
import { Item as Topic } from "../../types/API/Topics";
import { Item as ServiceUser } from '../../types/API/ServiceUser';
import { Item as Configuration } from '../../types/API/Configuration';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from "../../APIClients";
import { APISuccessData, GenericItem } from "../../types/Generics";
import { Form } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../hooks";
type Props = {
  index: number;
  endpoint: string;
  needCascade: boolean;
  humanKey: string;
  search: string;
  searchFields: Array<string>;
  editPageName: string;
  deletable: boolean;
  selectable: boolean;
}
/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, endpoint, originalItem, humanKey, search, searchFields, editPageName
 * @returns Table row for editing an object
 */
export default function EditListRow({ index, endpoint, needCascade, humanKey, search, searchFields, editPageName, deletable, selectable }: Props) {
  const dispatch = useAppDispatch()
  const originalItem = useAppSelector(state => state.edit.items)[index]

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

  function saveItem() {
    dispatch(showSpinner(true))
    APIClient.patch(`${endpoint}/${'key' in originalItem ? (originalItem as Configuration).key : originalItem.id}?minimal=true`, item).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });
    setEdit(false)

    function okCallback(response: APISuccessData) {
      setItem(response.data as GenericItem)
      dispatch(updateItem({ index, item: response.data as GenericItem })) // Do we need to update the main list (unnecessary rerender)?
      dispatch(toast({ header: "Item successfully edited", body: `Item "${(response.data as GenericItem)[humanKey]}" edited` }))
    }
  }

  function handleDeleteItem() {
    const parameters = []
    if (force) {
      parameters.push("force=true")
      if (cascade) {
        parameters.push("cascade=true")
      }
    }
    dispatch(showSpinner(true))
    APIClient.delete(`${endpoint}/${originalItem.id}?${parameters.join("&")}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });
    setEdit(false)
    setShowDeleteModal(false)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Item successfully deleted", body: `Item "${originalItem[humanKey]}" deleted.` }))
      dispatch(removeItem(index))
    }
  }

  if (inSearchField(search, searchFields, item) || edit) {
    let row = <></>
    const deleteModal = <DeleteConfirmationModal show={showDeleteModal} item={String(item[humanKey])} onCancel={() => setShowDeleteModal(false)} onConfirm={() => handleDeleteItem()} onForceChange={e => setForce(e)} force={force} needCascade={needCascade} onCascadeChange={e => setCascade(e)} />

    switch (editPageName) {
      case "Catalogues":
        row = <CatalogueEditListRow updateTempItem={updateTempItem} edit={edit} item={item as Catalogue} />
        break;
      case "ExtraEntries":
        row = <ExtraEntryEditListRow updateTempItem={updateTempItem} edit={edit} item={item as Extra} />
        break;
      case "ExtraTypes":
        row = <ExtraTypeEditListRow updateTempItem={updateTempItem} edit={edit} item={item as Type} />
        break;
      case "Requirements":
        row = <RequirementEditListRow index={index} updateTempItem={updateTempItem} edit={edit} item={item as Requirement} originalItem={originalItem as Requirement} />
        break;
      case "Tags":
        row = <TagEditListRow updateTempItem={updateTempItem} edit={edit} item={item as Tag} />
        break;
      case "Topics":
        row = <TopicEditListRow updateTempItem={updateTempItem} edit={edit} item={item as Topic} />
        break;
      case "ServiceUser":
        row = <ServiceUserEditListRow updateTempItem={updateTempItem} edit={edit} item={item as ServiceUser} />
        break;
      case "System Configuration":
        row = <ConfigurationEditListRow updateTempItem={updateTempItem} edit={edit} item={item as Configuration} />
        break;
      default:
        row = <></>
        break;
    }
    return (
      <tr>
        {row}
        <td><EditButtons saveItem={saveItem} edit={edit} setEdit={setEdit} resetTempItem={resetTempItem} setShowDeleteModal={setShowDeleteModal} deletable={deletable} /></td>
        {selectable ? <td><Form.Check inline id={String(index)} type="checkbox" aria-label="All" onChange={() => { dispatch(toggleSelected(index)) }} checked={originalItem.selected} /></td> : null}
        {deleteModal}
      </tr>
    )
  }
}
