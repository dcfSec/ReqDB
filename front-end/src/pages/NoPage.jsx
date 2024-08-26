import { Alert, Col, Row } from "react-bootstrap";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

/**
 * View for a 404 page
 * 
 * @returns Returns a 404 page
 */
export default function NoPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Page not Found", active: true }]))
    dispatch(setPageTitle("Page not Found"))
  }, []);

  return <>
    <Row>
      <Col><h2>Page not Found</h2></Col>
    </Row>
    <Row>
      <Col><Alert variant="danger">The requested page does not exist.</Alert>
      </Col>
    </Row>
  </>;
}
