import { SearchField } from "../MiniComponents";
import { setSearch } from '../../stateSlices/BrowseSlice';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { Form } from "react-bootstrap";


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @returns A row for the browse view
 */
export default function Search() {
  const dispatch = useAppDispatch()


  const items = useAppSelector(state => state.browse.rows.items)
  const selectedCount = [...useAppSelector(state => state.browse.rows.items).filter(function (v) { return v.visible === true; })].length

  const [query, setQuery] = useState("")

  useEffect(() => {
    dispatch(setSearch(query))
  }, [query]);

  return (
    <>
      <SearchField title="Requirements" onSearch={setQuery} />
      {selectedCount != items.length ? <Form.Text id="searchHelp" muted>{selectedCount}/{items.length} requirements visible</Form.Text> : null}
    </>
  )
}
