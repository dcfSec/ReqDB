import { SearchField } from "../MiniComponents";
import { setSearch } from '../../stateSlices/BrowseSlice';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @returns A row for the browse view
 */
export default function Search() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation();


  const items = useAppSelector(state => state.browse.rows.items)
  const selectedCount = [...useAppSelector(state => state.browse.rows.items).filter(function (v) { return v.visible === true; })].length

  const [query, setQuery] = useState("")

  useEffect(() => {
    dispatch(setSearch(query))
  }, [query]);

  return (
    <>
      <SearchField title="Requirements" onSearch={setQuery} />
      {selectedCount != items.length ? <Form.Text id="searchHelp" muted>{t('login.sso', { count: `${selectedCount}/${items.length}` })}</Form.Text> : null}
    </>
  )
}
