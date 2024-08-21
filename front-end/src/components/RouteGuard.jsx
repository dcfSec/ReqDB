import { Col, Container, Row } from "react-bootstrap";
import { MainBreadcrumb } from "./MiniComponents";
import { useSelector } from 'react-redux'

/**
 * Route guard to protect protected resources
 * 
 * @param {object} props Props for this component: roles, title, children
 * @returns Route gard container for the jwt secured routes
 */
export default function RouteGuard({ requiredRoles, title, children }) {
  const roles = useSelector(state => state.user.roles)
  const isAuthorized = (requiredRoles.filter((role) => roles.includes(role)).length > 0);

  const breadcrumbs = [
    { href: "", title: title, active: true }
  ]

  return (
    <>
      {isAuthorized ? (children) :
        <Container fluid className="bg-body">
          <Row>
            <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
          </Row>
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
        </Container>
      }
    </>
  );
};
