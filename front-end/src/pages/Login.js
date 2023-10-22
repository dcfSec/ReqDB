import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import { useMsal } from "@azure/msal-react";

/**
 * View to display the button to login with the oauth provider
 * 
 * @returns View for login page
 */
export default function Login() {
  const title = "Login"
  const breadcrumbs = [
    { href: "", title: title, active: true }
  ]

  const { instance } = useMsal();

  return <Container fluid className="bg-body">
    <Row>
      <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
    </Row>
    <Row>
      <Col><h1>ReqDB</h1></Col>
    </Row>
    <Row>
      <Col>
        <Stack gap={2} className="col-md-3 mx-auto">
          <h2>Welcome to ReqDB</h2>
          <Button onClick={() => { instance.loginRedirect(); }} variant="outline-secondary">Login with Azure Entra</Button>
        </Stack>
      </Col>
    </Row>
  </Container>;
};
