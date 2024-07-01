import { SearchField } from "../MiniComponents";
import { useDispatch } from 'react-redux'
import { setSearch } from '../../stateSlices/BrowseSlice';
import { useEffect, useState } from "react";


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, extraHeaders, row, search, tags, tagFiltered, topicFiltered, markRowCallback, markRowChecked
 * @returns A row for the browse view
 */
export default function Search() {
  const dispatch = useDispatch()

  const [ query, setQuery ] = useState("")

  useEffect(() => {
    const timeOutId = setTimeout(() => dispatch(setSearch(query)), 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return <SearchField title="Requirements" search={query} onSearch={setQuery} />

}
