import { Button, Col, Row } from "react-bootstrap";
import { useAppSelector } from "../hooks";
import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";


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
export default function RouteGuard({ requiredRoles, children } : Props) {
  const roles = useAppSelector(state => state.user.roles)
  const isAuthorized = (requiredRoles.filter((role) => roles.includes(role)).length > 0);
  const auth = useAuth();
  
  return (
    <>
      {auth.isAuthenticated && isAuthorized ? (children) :
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
              <Button onClick={() => void auth.removeUser()} variant="outline-secondary">Logout</Button>
            </Col>
          </Row>
        </>
      }
    </>
  );
};
