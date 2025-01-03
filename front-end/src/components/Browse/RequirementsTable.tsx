import { ReactNode, Suspense } from "react";
import { Form } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import { useAppDispatch, useAppSelector } from "../../hooks";
import { toggleSelectAll } from '../../stateSlices/BrowseSlice';


type Props = {
  children: ReactNode
}

/**
 * Component for a default data table
 * 
 * @param {object} props Props for the component: headers, children, markAll, markAllCallback, markAllChecked
 * @returns Returns a data table with default header
 */
export default function RequirementsTable({ children }: Props) {

  const dispatch = useAppDispatch()
  const allSelected = useAppSelector(state => state.browse.rows.allSelected)
  const extraHeaders = useAppSelector(state => state.browse.extraHeaders)

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
