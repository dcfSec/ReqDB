import { Button, Col, Row, Stack } from "react-bootstrap";
import { useMsal } from "@azure/msal-react";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

/**
 * View to display the button to login with the oauth provider
 * 
 * @returns View for login page
 */
export default function Login() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Login", active: true }]))
    dispatch(setPageTitle("Login"))
  }, []);


  const { instance } = useMsal();

  return <>
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
  </>;
};
