import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SearchField } from './MiniComponents';

/**
 * Component for the main layout for the editor pages. This includes breadcrumbs, the title and  the search bar
 * 
 * @param {object} props Props for this component: title, children, search, onSearch
 * @returns Returns a container for the main editor layout
 */
export default function DataLayout({ title, children, search, onSearch }) {

  return (
    <>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        <Col><SearchField title={title} search={search} onSearch={onSearch}></SearchField></Col>
      </Row>
      {children}
    </>
  );
}
