import { ReactNode, Suspense } from "react";
import Table from 'react-bootstrap/Table';


type Props = {
  headers: Array<string | ReactNode>;
  children: ReactNode;
}

/**
 * Component for the table for the edit pages
 * 
 * @param {object} props Props for the component: headers, children
 * @returns Returns a edit table with headers
 */
export default function DataTable({ headers, children }: Props) {
  return (
    <Table responsive id="DataTable" striped>
      <Suspense fallback={null}>
        <thead>
          <tr>
            {headers.map((item, index) => (
              <th key={index}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </Suspense>
    </Table>
  );
}
