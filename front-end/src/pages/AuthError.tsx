import { Alert, Col, Row } from "react-bootstrap";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";


type Props = {
    error: string;
}

/**
 * View to display the button to login with the oauth provider
 * 
 * @returns View for login page
 */
export default function AuthError({error}: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "AuthError", active: true }]))
    dispatch(setPageTitle("Auth Error"))
  }, []);

  return <>
    <Row>
      <Col><h1>Auth Error</h1></Col>
    </Row>
    <Row>
      <Col>
        <Alert variant="danger">Authentication error: {error}</Alert>
      </Col>
    </Row>
  </>;
};
