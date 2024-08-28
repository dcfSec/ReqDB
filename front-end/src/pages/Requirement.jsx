import { Alert, Badge, Card, Col, Container, Row, Form } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import CommentEntry from "../components/Comments/CommentEntry";
import AddComment from "../components/Comments/AddComment";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import { appRoles } from '../authConfig';
import LoadingBar from "../components/LoadingBar";

import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { useParams } from "react-router-dom";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useDispatch, useSelector } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setRequirement } from "../stateSlices/RequirementSlice";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";

/**
 * View to select a catalogue to browse in the BrowseCatalogue view
 * 
 * @returns View to select a catalogue
 */
export default function Requirement() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setPageTitle("View Requirement - Loading..."))
    dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: "View Requirement", active: true }]))
  }, []);

  const roles = useSelector(state => state.user.roles)
  const requirement = useSelector(state => state.requirement.requirement)
  const title = useSelector(state => state.layout.pageTitle)

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  const [showCompleted, setShowCompleted] = useState(false);

  const params = useParams();
  const id = params.requirementId

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
    execute("GET", `requirements/${id}`).then((response) => {
      if (response && response.status === 200) {
        dispatch(setRequirement(response.data))
        dispatch(setPageTitle(`${response.data.key} - ${response.data.title}`))
        dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: `${response.data.key} - ${response.data.title}`, active: true }]))
        setFetched(true);
      } else if (response && response.status !== 200) {
        setAPIError(response.message)
        setFetched(true);
      }
    });
  }, [execute])

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    const completedCount = [...requirement.comments].filter((el) => el.completed == true).length
    body = <Container>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h3">Tags</Card.Header>
            <Card.Body>
              <Card.Text>{[...requirement.tags].map(tag => (<span key={tag.id}><Badge bg="secondary">{tag.name}</Badge>{' '}</span>))}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Header as="h3">Topics</Card.Header>
            <Card.Body>
              <Card.Text>{buildTopicsList({ ...requirement.parent }).map(topic => (<span key={topic}>{' '}<FontAwesomeIcon icon={solid("arrow-right")} />{' '}<Badge bg="secondary">{topic}</Badge></span>))}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h3">Description</Card.Header>
            <Card.Body>
              <ReactMarkdown className="card-text">{requirement.description}</ReactMarkdown>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h3">Extras</Card.Header>
            <Card.Body>
              {[...requirement.extras].map(extra => (<span key={extra.id} ><Card.Title>{extra.extraType.title}</Card.Title>{printExtraWithType(extra.extraType.extraType, extra.content)}</span>))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {roles.includes(appRoles.Comments.Reader) || roles.includes(appRoles.Comments.Writer) ?
        <Row>
          <Col>
            <Card>
              <Card.Header as="h3">Comments</Card.Header>
              <Card.Body>
                {completedCount > 0 ? <Form.Check type="switch" id="completed" defaultChecked={showCompleted} onChange={e => { setShowCompleted(e.target.checked) }} label={`${completedCount} comments completed. Show completed`} reverse /> : null}
                {roles.includes(appRoles.Comments.Reader) ? [...requirement.comments].sort((a, b) => a.id - b.id).map((item, commentIndex) => <CommentEntry view={"requirement"} rowIndex={null} commentIndex={commentIndex} comment={item} key={`comment-${commentIndex}`} showCompleted={showCompleted} />) : null}
                {roles.includes(appRoles.Comments.Writer) ? <><Card.Title>Add Comment</Card.Title><AddComment view={"requirement"} index={null} requirementId={requirement["id"]} /></> : null}
              </Card.Body>
            </Card>
          </Col>
        </Row> : null
      }
    </Container>
  }

  function buildTopicsList(topic) {
    let r = [topic.title]
    if (topic.parent !== null) {
      r = buildTopicsList(topic.parent).concat(r)
    }
    return r
  }

  function printExtraWithType(extraType, content) {
    if (extraType === 1) {
      return <p>{content}</p>
    } else if (extraType === 2) {
      return <ReactMarkdown>{content}</ReactMarkdown>
    } else if (extraType === 3) {
      return <p>{content}</p>
    } else {
      return <></>
    }
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
