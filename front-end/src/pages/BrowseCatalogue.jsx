import { Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux'
import LoadingBar from "../components/LoadingBar";
import BrowseContent from "../components/Browse/BrowseContent";
import { setBreadcrumbs } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";

/**
 * View to browse a
 * 
 * @returns View to browse a catalogues
 */
export default function BrowseCatalogue() {

  const title = useSelector(state => state.layout.pageTitle)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: title, active: true }]))
  }, []);

  const params = useParams();
  const id = params.catalogueId

  return (
    <>
      <Row>
        <Col><h2>Browse <code>{title}</code></h2></Col>
      </Row>
      <BrowseContent id={id} />
      <LoadingBar />
    </>
  );
}
