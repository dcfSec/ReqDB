import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import LoadingBar from "../components/LoadingBar";

import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setRequirement } from "../stateSlices/RequirementSlice";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { CommentCard, DescriptionCard, ExtraCard, TagsCard, TopicsCard } from "../components/Requirement/RequirementCards";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import APIClient from "../APIClient";

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
  const [APIError, setAPIError] = useState(null);
  const [error, setError] = useState(null);

  const params = useParams();
  const id = params.requirementId

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
    APIClient.get( `requirements/${id}`).then((response) => {
      if (response && response.status === 200) {
        dispatch(setRequirement(response.data.data))
        dispatch(setPageTitle(`${response.data.data.key} - ${response.data.data.title}`))
        dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: `${response.data.data.key} - ${response.data.data.title}`, active: true }]))
        setFetched(true);
      } else if (response && response.status !== 200) {
        setAPIError(response.data.message)
        setFetched(true);
      }
    }).catch((error) => {
      if (error.response) {
        setError(error.response.data.message)
        dispatch(showSpinner(false))
        setFetched(true);
      } else {
        setError(error.message);
        dispatch(showSpinner(false))
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
    body = <Container>
      <Row>
        <Col><Button><FontAwesomeIcon icon={solid("code-compare")} /></Button></Col>
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
