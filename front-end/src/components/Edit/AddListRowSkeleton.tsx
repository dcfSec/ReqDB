import { useState } from "react";

import { useDispatch } from 'react-redux'
import { toast } from "../../stateSlices/NotificationToastSlice";
import { addItem } from "../../stateSlices/EditSlice";

import { CatalogueAddListRow } from "./Catalogues/AddListRow"
import { ExtraEntryAddListRow } from "./ExtraEntries/AddListRow"
import { ExtraTypeAddListRow } from "./ExtraTypes/AddListRow"
import { RequirementAddListRow } from "./Requirements/AddListRow"
import { TagAddListRow } from "./Tags/AddListRow"
import { TopicAddListRow } from "./Topics/AddListRow"

import { Item as Catalogue } from '../../types/API/Catalogues';
import { Item as Extra } from '../../types/API/Extras';
import { Type } from '../../types/API/Extras';
import { Item as Requirement } from "../../types/API/Requirements";
import { Item as Tag } from "../../types/API/Tags";
import { Item as Topic } from "../../types/API/Topics";
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from "../../APIClient";
import { APISuccessData, GenericItem } from "../../types/Generics";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";


type Props = {
  blankItem: Catalogue | Extra | Type | Requirement | Tag | Topic;
  humanKey: string;
  endpoint: string;
  editPageName: string;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: blankItem, humanKey, endpoint, editPageName, updateParent
 * @returns A table row to add an item
 */
export default function AddListRowSkeleton({ blankItem, humanKey, endpoint, editPageName }: Props) {

  const dispatch = useDispatch()

  const [newItem, setNewItem] = useState(blankItem);

  function postItem() {
    dispatch(showSpinner(true))
    APIClient.post(`${endpoint}`, newItem).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: APISuccessData) {
      dispatch(addItem(response.data as GenericItem))
      dispatch(toast({ header: "Item created", body: `Item "${(response.data as GenericItem)[humanKey]}" created.` }))
      setNewItem(blankItem)
    }
  }

  function updateNewItem(properties: object) {
    const tempItem = { ...newItem, ...properties }
    setNewItem(tempItem)
  }

  switch (editPageName) {
    case "Catalogues":
      return <CatalogueAddListRow newItem={newItem as Catalogue} updateNewItem={updateNewItem} postItem={postItem} />
    case "ExtraEntries":
      return <ExtraEntryAddListRow newItem={newItem as Extra} updateNewItem={updateNewItem} postItem={postItem} />
    case "ExtraTypes":
      return <ExtraTypeAddListRow newItem={newItem as Type} updateNewItem={updateNewItem} postItem={postItem} />
    case "Requirements":
      return <RequirementAddListRow newItem={newItem as Requirement} updateNewItem={updateNewItem} postItem={postItem} />
    case "Tags":
      return <TagAddListRow newItem={newItem as Tag} updateNewItem={updateNewItem} postItem={postItem} />
    case "Topics":
      return <TopicAddListRow newItem={newItem as Topic} updateNewItem={updateNewItem} postItem={postItem} />
    default:
      return <></>
  }
}
