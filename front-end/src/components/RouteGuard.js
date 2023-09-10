import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { MainBreadcrumb } from "./MiniComponents";

export default function RouteGuard(props) {
  const { instance } = useMsal();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onLoad = async () => {
    const currentAccount = instance.getActiveAccount();

    if (currentAccount && currentAccount.idTokenClaims['roles']) {
      let intersection = props.roles.filter((role) => currentAccount.idTokenClaims['roles'].includes(role));

      if (intersection.length > 0) {
        setIsAuthorized(true);
      }
      setIsLoading(false)
    }
  };

  useEffect(() => {
    onLoad();
  }, [instance]);

  const breadcrumbs = [
      { href: "", title: props.title, active: true }
  ]

  return (
    <>
      {isAuthorized ? (
        props.children
      ) : ( !isLoading ?
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
                  {props.roles.map((role) => (<li key={role}><code>{role}</code></li>))}
                </ul>
            </Col>
          </Row>
        </Container> : null
      )}
    </>
  );
};