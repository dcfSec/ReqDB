import { Col, Container, Row } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import { useParams } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux'
import { reset } from '../stateSlices/BrowseSlice';
import LoadingBar from "../components/LoadingBar";
import BrowseContent from "../components/Browse/BrowseContent";

/**
 * View to browse a
 * 
 * @returns View to browse a catalogues
 */
export default function BrowseCatalogue() {
  const title = useSelector(state => state.browse.title)

  //dispatch(reset());

  const breadcrumbs = [
    { href: "/Browse", title: "Browse", active: false }
  ]

  const params = useParams();
  const id = params.catalogueId

  document.title = `${title} | ReqDB - Requirement Database`;
  breadcrumbs.push({ href: "", title: title, active: true })

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>Browse <code>{title}</code></h2></Col>
      </Row>
      <BrowseContent id={id}/>
      <LoadingBar/>
    </Container>
  );
}
