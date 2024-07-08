import { useState, lazy, Suspense } from "react";
import useFetchWithMsal from "../../hooks/useFetchWithMsal";
import { protectedResources } from "../../authConfig";

import { useDispatch } from 'react-redux'
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { addItem } from "../../stateSlices/EditSlice";

import { CatalogueAddListRow } from "./Catalogues/AddListRow"
import { ExtraEntryAddListRow } from "./ExtraEntries/AddListRow"
import { ExtraTypeAddListRow } from "./ExtraTypes/AddListRow"
import { RequirementAddListRow } from "./Requirements/AddListRow"
import { TagAddListRow } from "./Tags/AddListRow"
import { TopicAddListRow } from "./Topics/AddListRow"

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: blankItem, humanKey, endpoint, editPageName, updateParent
 * @returns A table row to add an item
 */
export default function AddListRowSkeleton({ blankItem, humanKey, endpoint, editPageName, updateParent }) {

  const dispatch = useDispatch()

  const [newItem, setNewItem] = useState(blankItem);

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  if (error) {
    dispatch(toast({ header: "UnhandledError", body: error.message }))
    dispatch(showSpinner(false))
  }

  function postItem() {
    execute("POST", `${endpoint}`, newItem).then(
      (response) => {
        if (response.status === 200) {
          dispatch(addItem(response.data))
          dispatch(toast({ header: "Item created", body: `Item "${response.data[humanKey]}" created.` }))
          setNewItem(blankItem)
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

  function updateNewItem(properties) {
    const tempItem = { ...newItem, ...properties }
    setNewItem(tempItem)
  }


  let body = <></>
  switch (editPageName) {
    case "Catalogues":
      body = <CatalogueAddListRow newItem={newItem} updateNewItem={updateNewItem} postItem={postItem}/>
      break;
    case "ExtraEntries":
      body = <ExtraEntryAddListRow newItem={newItem} updateNewItem={updateNewItem} postItem={postItem} />
      break;
    case "ExtraTypes":
      body = <ExtraTypeAddListRow newItem={newItem} updateNewItem={updateNewItem} postItem={postItem} />
      break;
    case "Requirements":
      body = <RequirementAddListRow newItem={newItem} updateNewItem={updateNewItem} postItem={postItem} />
      break;
    case "Tags":
      body = <TagAddListRow newItem={newItem} updateNewItem={updateNewItem} postItem={postItem} updateParent={updateParent} />
      break;
    case "Topics":
      body = <TopicAddListRow newItem={newItem} updateNewItem={updateNewItem} postItem={postItem} />
      break;
    default:
      break;
  }

  return body
}
