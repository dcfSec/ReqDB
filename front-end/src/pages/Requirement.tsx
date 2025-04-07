import { Alert, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import LoadingBar from "../components/LoadingBar";

import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setRequirement } from "../stateSlices/RequirementSlice";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { CommentCard, DescriptionCard, ExtraCard, TagsCard, TopicsCard } from "../components/Requirement/RequirementCards";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import APIClient, { handleError, handleResult } from "../APIClient";
import { APIErrorData, APISuccessData } from "../types/Generics";
import { Item as RequirementItem } from "../types/API/Requirements";

/**
 * View to select a catalogue to browse in the BrowseCatalogue view
 * 
 * @returns View to select a catalogue
 */
export default function Requirement() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("View Requirement - Loading..."))
    dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: "View Requirement", active: true }]))
  }, []);

  const title = useAppSelector(state => state.layout.pageTitle)

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState<string | Array<string> | Record<string, Array<string>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params.requirementId

  useEffect(() => {
    dispatch(reset());
    dispatch(showSpinner(true))
    APIClient.get(`requirements/${id}`).then((response) => {
      handleResult(response, okCallback, APIErrorCallback)
    }).catch((error) => {
      handleError(error, APIErrorCallback, errorCallback)
    });
  }, [])

  function okCallback(response: APISuccessData) {
    dispatch(setRequirement(response.data as RequirementItem))
    dispatch(setPageTitle(`${(response.data as RequirementItem).key} - ${(response.data as RequirementItem).title}`))
    dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: `${(response.data as RequirementItem).key} - ${(response.data as RequirementItem).title}`, active: true }]))
    setFetched(true);
  }

  function APIErrorCallback(response: APIErrorData) {
    setAPIError(response.message)
    setFetched(true);
  }

  function errorCallback(error: string) {
    setError(error);
    setFetched(true);
  }

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    body = <Container>
      <Row>
        {/* <Col><Button><FontAwesomeIcon icon={"code-compare"} /></Button></Col> */}
      </Row>
      <Row>
        <Col>
          <TagsCard />
        </Col>
        <Col>
          <TopicsCard />
        </Col>
      </Row>
      <Row>
        <Col>
          <DescriptionCard />
        </Col>
      </Row>
      <Row>
        <Col>
          <ExtraCard />
        </Col>
      </Row>
      <Row>
        <Col>
          <CommentCard />
        </Col>
      </Row>
    </Container>
  }

  return (
    <>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        <Col>
          {body}
        </Col>
      </Row>
    </>
  );
}
