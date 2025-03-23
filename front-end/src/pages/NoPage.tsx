import { Alert, Col, Row } from "react-bootstrap";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";
import { useAppDispatch } from "../hooks";

/**
 * View for a 404 page
 * 
 * @returns Returns a 404 page
 */
export default function NoPage() {
  const dispatch = useAppDispatch()

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
