import { Button, Col, Row } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../hooks";
import { ReactNode } from "react";
import { APIErrorToastCallback, authClient, errorToastCallback, handleError, handleResult } from "../APIClient";
import { APISuccessData } from "../types/Generics";
import { setAuthenticated, setExpiresAt, setToken } from "../stateSlices/UserSlice";


type Props = {
  requiredRoles: Array<string>;
  children: ReactNode;
}
/**
 * Route guard to protect protected resources
 * 
 * @param {object} props Props for this component: roles, title, children
 * @returns Route gard container for the jwt secured routes
 */
export default function RouteGuard({ requiredRoles, children }: Props) {
  const dispatch = useAppDispatch()

  const roles = useAppSelector(state => state.user.roles)
  const isAuthorized = (requiredRoles.filter((role) => roles.includes(role)).length > 0);
  const isAuthenticated = useAppSelector(state => state.user.authenticated)

  function onLogout() { //May
    authClient.get("/logout").then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)

    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)

    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(setToken(""))
      dispatch(setExpiresAt(0))
      dispatch(setAuthenticated(false))
    }
  }


  return (
    <>
      {isAuthenticated && isAuthorized ? (children) :
        <>
          <Row>
            <Col><h1>Unauthorized</h1></Col>
          </Row>
          <Row>
            <Col>
              <p>You are missing the role(s):</p>
              <ul>
                {requiredRoles.map((role) => (<li key={role}><code>{role}</code></li>))}
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>Your roles are:</p>
              <ul>
                {roles.map((role) => (<li key={role}><code>{role}</code></li>))}
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>Logout to refresh your token if you think this is an error:</p>
              <Button onClick={onLogout} variant="outline-secondary">Logout</Button>
            </Col>
          </Row>
        </>
      }
    </>
  );
};
