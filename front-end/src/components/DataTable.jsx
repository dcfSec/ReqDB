import { Suspense } from "react";
import { Form } from "react-bootstrap";
import Table from 'react-bootstrap/Table';

/**
 * Component for a default data table
 * 
 * @param {object} props Props for the component: headers, children, markAll, markAllCallback, markAllChecked
 * @returns Returns a data table with default header
 */
export default function DataTable({ headers, children, markAll = false, markAllCallback, markAllChecked }) {
  return (
    <Table responsive id="DataTable">
      <Suspense fallback={null}>
        <thead>
          <tr>
            {headers.map((item, index) => (
              <th key={index}>{item}</th>
            ))}
            {markAll === true ? <th><Form.Check inline id="_all" type="checkbox" aria-label="All" onChange={markAllCallback} checked={markAllChecked} /></th> : null}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </Suspense>
    </Table>
  );
}
