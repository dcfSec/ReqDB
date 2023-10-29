import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { MainBreadcrumb, SearchField } from '../MiniComponents';

/**
 * Component for the main layout for the editor pages. This includes breadcrumbs, the title and  the search bar
 * 
 * @param {object} props Props for this component: title, children, search, onSearch
 * @returns Returns a container for the main editor layout
 */
export default function EditorLayout(props) {
  const { title, children, search, onSearch } = props
  const breadcrumbs = [
    { href: "", title: "Edit", active: true },
    { href: "", title: title, active: true }
  ]
  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        <Col><SearchField title={title} search={search} onSearch={onSearch}></SearchField></Col>
      </Row>
      <Row>
        {children}
      </Row>
    </Container>
  );
}
