import { SearchField } from "../MiniComponents";
import { setSearch } from '../../stateSlices/BrowseSlice';
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../hooks";


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @returns A row for the browse view
 */
export default function Search() {
  const dispatch = useAppDispatch()

  const [ query, setQuery ] = useState("")

  useEffect(() => {
    dispatch(setSearch(query))
  }, [query]);

  return <SearchField title="Requirements" onSearch={setQuery} />

}
