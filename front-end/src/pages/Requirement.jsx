import { Alert, Badge, Card, Col, Container, ProgressBar, Row } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import CommentEntry from "../components/Comments/CommentEntry";
import AddComment from "../components/Comments/AddComment";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import { appRoles } from '../authConfig';

import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { useParams } from "react-router-dom";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useDispatch, useSelector } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setRequirement } from "../stateSlices/RequirementSlice";

/**
 * View to select a catalogue to browse in the BrowseCatalogue view
 * 
 * @returns View to select a catalogue
 */
export default function Requirement() {
  const dispatch = useDispatch()

  const roles = useSelector(state => state.user.roles)
  const requirement = useSelector(state => state.requirement.requirement)

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  const params = useParams();
  const id = params.requirementId
  let title = "View Requirement"
  document.title = `${title} | ReqDB - Requirement Database`;

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
      execute("GET", `requirements/${id}`).then((response) => {
        if (response && response.status === 200) {
          dispatch(setRequirement(response.data))
          setFetched(true);
        } else if (response && response.status !== 200) {
          setAPIError(response.message)
          setFetched(true);
        }
      });
  }, [execute])

  let body = <ProgressBar animated now={100} />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
      title = `${requirement.key} - ${requirement.title}`
      document.title = `${title} | ReqDB - Requirement Database`;
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
                <Card.Text>{buildTopicsList({...requirement.parent}).map(topic => (<span key={topic}>{' '}<FontAwesomeIcon icon={solid("arrow-right")} />{' '}<Badge bg="secondary">{topic}</Badge></span>))}</Card.Text>
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
                  {roles.includes(appRoles.Comments.Reader) ? [...requirement.comments].sort((a, b) => a.id - b.id).map((item, commentIndex) => <CommentEntry view={"requirement"} rowIndex={null} commentIndex={commentIndex} comment={item} key={`comment-${commentIndex}`} />) : null}
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

  const breadcrumbs = [
    { href: "/Browse", title: "Browse", active: false },
    { href: "", title: title, active: true }
  ]

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        <Col>
          {body}
        </Col>
      </Row>
    </Container>
  );
}
