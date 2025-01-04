import { Alert, Col, ListGroup, Row, Stack } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import SelectCatalogueItem from "../components/Browse/SelectCatalogueItem";

import { useAppDispatch, useAppSelector } from "../hooks";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { set, reset, sort } from "../stateSlices/CatalogueDataSlice";
import LoadingBar from "../components/LoadingBar";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import APIClient from "../APIClient";

/**
 * View to select a catalogue to browse in the BrowseCatalogue view
 * 
 * @returns View to select a catalogue
 */
export default function BrowseSelectCatalogue() {
  const dispatch = useAppDispatch()
  const catalogueData = useAppSelector(state => state.catalogueData.items)

  useEffect(() => {
    dispatch(setPageTitle("Browse - Select Requirement Catalogue"))
    dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: "Select Requirement Catalogue", active: true }]))
  }, []);

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
    APIClient.get( `catalogues`).then((response) => {
      if (response && response.data && response.data.status === 200) {
        dispatch(set(response.data.data));
        dispatch(sort());
        setFetched(true);
      } else if (response && response.data && response.data.status !== 200) {
        setAPIError(response.data.message)
        setFetched(true);
      } else {
        setAPIError(response.data.message)
        setFetched(true);
      }
    }).catch((error) => {
        if (error.response) {
          setAPIError(error.response.data.message);
          setFetched(true);
        } else {
          setError(error.message);
          setFetched(true);
        }
      });
  }, [])

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    if (catalogueData.length > 0) {
      body = <Stack gap={2} className="col-md-5 mx-auto"><ListGroup>
      {catalogueData.map((catalogue, index) => (<SelectCatalogueItem key={index} catalogue={catalogue} />))}
    </ListGroup></Stack>
    } else {
      body = <Alert variant="warning">No catalogues found. Ask your administrator to add a requirement catalogue</Alert>

    }
  }

  return (
    <>
      <Row>
        <Col><h2>Select Catalogue</h2></Col>
      </Row>
      <Row>
        <Col>
          {body}
        </Col>
      </Row>
    </>
  );
}
