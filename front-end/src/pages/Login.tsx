import { Alert, Button, Col, Row, Stack } from "react-bootstrap";
import Markdown from 'react-markdown'
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { staticConfig } from "../static";
import { useAuth } from "react-oidc-context";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";

/**
 * View to display the button to login with the oauth provider
 * 
 * @returns View for login page
 */
export default function Login({ authError = null }: { authError?: string | null; }) {
  const dispatch = useDispatch()

  const [buttonText, setButtonText] = useState(`Login with ${staticConfig.oauth.provider}`);

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Login", active: true }]))
    dispatch(setPageTitle("Login"))
  }, []);

  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) {
      setButtonText("Loading...")
    } else {
      setButtonText(`Login with ${staticConfig.oauth.provider}`)
    }
  }, [auth.isLoading]);

  function onAuth() {
    dispatch(showSpinner(true))
    auth.signinRedirect()
  }

  return <>
    <Row>
      <Col><h1>ReqDB</h1></Col>
    </Row>
    <Row>
      <Col>
      {authError !== null ? <Alert variant="danger">{`Authentication error: ${authError}`}</Alert> : null}
        <Stack gap={2} className="col-md-3 mx-auto">
          <h2>{staticConfig.home.title}</h2>
          <Markdown>{staticConfig.login.MOTD.pre}</Markdown>
          <Button onClick={(onAuth)} disabled={auth.isLoading} variant="outline-secondary">{buttonText}</Button>
          <Markdown>{staticConfig.login.MOTD.post}</Markdown>
        </Stack>
      </Col>
    </Row>
  </>;
};
