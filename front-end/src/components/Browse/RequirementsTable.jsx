import { useEffect, useState, Suspense } from "react";
import { Form } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import BrowseRow from "./BrowseRow";
import { inSearchField } from "../MiniComponents";

import { useSelector, useDispatch } from 'react-redux'
import { toggleSelectAll, setVisibleRow } from '../../stateSlices/BrowseSlice';



/**
 * Component for a default data table
 * 
 * @param {object} props Props for the component: headers, children, markAll, markAllCallback, markAllChecked
 * @returns Returns a data table with default header
 */
export default function RequirementsTable({ children }) {

  const dispatch = useDispatch()
  const allSelected = useSelector(state => state.browse.rows.allSelected)
  const extraHeaders = useSelector(state => state.browse.extraHeaders)

  const headers = [
    "Tags",
    "Topics",
    "Key",
    "Title",
    "Description"
  ]

  return (
    <Table responsive id="RequirementsTable" striped>
      <Suspense fallback={null}>
        <thead>
          <tr>
            {["", ...headers, ...Object.keys(extraHeaders)].map((item, index) => (<th key={index}>{item}</th>))}
            <th><Form.Check inline id="_all" type="checkbox" aria-label="All" onChange={() => { dispatch(toggleSelectAll()) }} checked={allSelected} /></th>
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </Suspense>
    </Table>
  );
}
