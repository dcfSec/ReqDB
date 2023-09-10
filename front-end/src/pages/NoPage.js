import { Alert, Col, Container, Row } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";

export default function NoPage() {

  const title = "404"
  const breadcrumbs = [
      { href: "", title: title, active: true }
  ]

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>404 - Page not found</h2></Col>
      </Row>
      <Row>
        <Col><Alert variant="danger">The requested page does not exist.</Alert>
      </Col>
      </Row>
    </Container>
  );
}