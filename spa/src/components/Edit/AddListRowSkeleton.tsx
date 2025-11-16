import { useState } from "react";

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
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from "../../APIClients";
import { APISuccessData, GenericItem } from "../../types/Generics";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { Button } from "react-bootstrap";
import { useAppDispatch } from "../../hooks";


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

  const dispatch = useAppDispatch()

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

  const post = <><td><Button variant="success" onClick={() => postItem()}>Add</Button></td><td></td></>

  switch (editPageName) {
    case "Catalogues":
      return <tr><CatalogueAddListRow newItem={newItem as Catalogue} updateNewItem={updateNewItem} />{post}</tr>
    case "ExtraEntries":
      return <tr><ExtraEntryAddListRow newItem={newItem as Extra} updateNewItem={updateNewItem} />{post}</tr>
    case "ExtraTypes":
      return <tr><ExtraTypeAddListRow newItem={newItem as Type} updateNewItem={updateNewItem} />{post}</tr>
    case "Requirements":
      return <tr><RequirementAddListRow newItem={newItem as Requirement} updateNewItem={updateNewItem} />{post}</tr>
    case "Tags":
      return <tr><TagAddListRow newItem={newItem as Tag} updateNewItem={updateNewItem} />{post}</tr>
    case "Topics":
      return <tr><TopicAddListRow newItem={newItem as Topic} updateNewItem={updateNewItem} />{post}</tr>
    default:
      return <></>
  }
}
