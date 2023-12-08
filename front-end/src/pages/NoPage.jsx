import { Alert, Col, Container, Row } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";

/**
 * View for a 404 page
 * 
 * @returns Returns a 404 page
 */
export default function NoPage() {

  const title = "Page not found"
  const breadcrumbs = [
    { href: "", title: title, active: true }
  ]
  document.title = `${title} | ReqDB - Requirement Database`;

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        <Col><Alert variant="danger">The requested page does not exist.</Alert>
        </Col>
      </Row>
    </Container>
  );
}
