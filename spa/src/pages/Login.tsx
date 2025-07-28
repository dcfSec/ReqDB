import { Alert, Button, Col, Row, Stack } from "react-bootstrap";
import Markdown from 'react-markdown'
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useState } from "react";
import { staticConfig } from "../static";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { useAppDispatch } from "../hooks";
import { authClient } from "../APIClient";
import { setAuthenticated, setExpiresAt, setName, setRoles, setToken } from "../stateSlices/UserSlice";

/**
 * View to display the button to login with the oauth provider
 * 
 * @returns View for login page
 */
export default function Login({ authError = null, authErrorMessage = null }: { authError?: string | null; authErrorMessage?: string | null; }) {
  const dispatch = useAppDispatch()
  const [init, setInit] = useState(false)

  if (!init) {
    authClient.get("/token").then((response) => {
      dispatch(setToken(response.data.data["access_token"]))
      dispatch(setExpiresAt(response.data.data["expires_at"]))
      dispatch(setName(response.data.data["email"]))
      dispatch(setRoles(response.data.data["roles"]))
      dispatch(setAuthenticated(true))
    }).catch((/*error*/) => { /*console.log(error)*/ })
    dispatch(setBreadcrumbs([{ href: "", title: "Login", active: true }]))
    dispatch(setPageTitle("Login"))
    setInit(true)
  }

  function onAuth() {
    dispatch(showSpinner(true))
    window.location.href = '/auth/login?spa=1';
  }

  return <>
    <Row>
      <Col><h1>ReqDB</h1></Col>
    </Row>
    <Row>
      <Col>
        {authError !== null ? <Alert variant="danger">{`${authError}: ${authErrorMessage}`}</Alert> : null}
        <Stack gap={2} className="col-md-3 mx-auto">
          <h2>{staticConfig.home.title}</h2>
          <Markdown>{staticConfig.login.MOTD.pre}</Markdown>
          <Button onClick={(onAuth)} disabled={false} variant="outline-secondary">Login with {staticConfig.oauth.provider}</Button>
          <Markdown>{staticConfig.login.MOTD.post}</Markdown>
        </Stack>
      </Col>
    </Row>
  </>;
};
