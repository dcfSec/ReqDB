import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SearchField } from './MiniComponents';
import { ReactNode } from 'react';


type Props = {
  title: string;
  children: ReactNode;
  onSearch: (a: string) => void;
}

/**
 * Component for the main layout for the editor pages. This includes breadcrumbs, the title and  the search bar
 * 
 * @param {object} props Props for this component: title, children, search, onSearch
 * @returns Returns a container for the main editor layout
 */
export default function DataLayout({ title, children, onSearch }: Props) {

  return (
    <>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        <Col><SearchField title={title} onSearch={onSearch}></SearchField></Col>
      </Row>
      {children}
    </>
  );
}
