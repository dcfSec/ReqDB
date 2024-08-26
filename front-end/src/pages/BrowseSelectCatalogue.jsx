import { Alert, Col, Container, ListGroup, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import SelectCatalogueItem from "../components/Browse/SelectCatalogueItem";

import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { useSelector, useDispatch } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { set, reset, sort } from "../stateSlices/CatalogueDataSlice";
import LoadingBar from "../components/LoadingBar";

/**
 * View to select a catalogue to browse in the BrowseCatalogue view
 * 
 * @returns View to select a catalogue
 */
export default function BrowseSelectCatalogue() {
  const dispatch = useDispatch()
  const catalogueData = useSelector(state => state.catalogueData.items)
  
  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  const title = "Browse - Select Requirement Catalogue"
  const breadcrumbs = [
    { href: "", title: title, active: true }
  ]
  document.title = `${title} | ReqDB - Requirement Database`;

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
      execute("GET", `catalogues`).then((response) => {
        if (response && response.status === 200) {
          dispatch(set(response.data));
          dispatch(sort());
          setFetched(true);
        } else if (response && response.status !== 200) {
          setAPIError(response.message)
          setFetched(true);
        }
      });
  }, [execute])

  let body = <LoadingBar/>

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    body = <Stack gap={2} className="col-md-5 mx-auto"><ListGroup>
        {catalogueData.map((catalogue, index) => (<SelectCatalogueItem key={index} catalogue={catalogue} />))}
      </ListGroup></Stack>
  }

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>Select Catalogue</h2></Col>
      </Row>
      <Row>
        <Col>
          {body}
        </Col>
      </Row>
    </Container>
  );
}
