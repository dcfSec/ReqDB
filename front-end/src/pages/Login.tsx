import { Button, Col, Row, Stack } from "react-bootstrap";
import Markdown from 'react-markdown'
import { useMsal } from "@azure/msal-react";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { staticConfig } from "../static";

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
          <h2>{staticConfig.home.title}</h2>
          <Markdown>{staticConfig.home.MOTD.pre}</Markdown>
          <Button onClick={() => { instance.loginRedirect(); }} variant="outline-secondary">Login with Azure Entra</Button>
          <Markdown>{staticConfig.home.MOTD.post}</Markdown>
        </Stack>
      </Col>
    </Row>
  </>;
};
