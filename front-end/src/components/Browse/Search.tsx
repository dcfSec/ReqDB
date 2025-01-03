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
    const timeOutId = setTimeout(() => dispatch(setSearch(query)), 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return <SearchField title="Requirements" search={query} onSearch={setQuery} />

}
