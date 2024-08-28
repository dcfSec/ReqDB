import { Badge, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { appRoles } from '../../authConfig';
import { useSelector } from 'react-redux'
import { useState } from "react";
import CommentEntry from "../Comments/CommentEntry";
import AddComment from "../Comments/AddComment";


/**
 * Card for listing the tags
 * 
 * @returns Card for listing the tags
 */
export function TagsCard() {

  const requirement = useSelector(state => state.requirement.requirement)

  return (
    <Card>
      <Card.Header as="h3">Tags</Card.Header>
      <Card.Body>
        <Card.Text>{[...requirement.tags].map(tag => (<span key={tag.id}><Badge bg="secondary">{tag.name}</Badge>{' '}</span>))}</Card.Text>
      </Card.Body>
    </Card>
  )
}

/**
 * Card for listing the parent topics
 * 
 * @returns Card with the parent topics
 */
export function TopicsCard() {

  const requirement = useSelector(state => state.requirement.requirement)

  function buildTopicsList(topic) {
    let r = [topic.title]
    if (topic.parent !== null) {
      r = buildTopicsList(topic.parent).concat(r)
    }
    return r
  }

  return (
    <Card>
      <Card.Header as="h3">Topics</Card.Header>
      <Card.Body>
        <Card.Text>{buildTopicsList({ ...requirement.parent }).map(topic => (<span key={topic}>{' '}<FontAwesomeIcon icon={solid("arrow-right")} />{' '}<Badge bg="secondary">{topic}</Badge></span>))}</Card.Text>
      </Card.Body>
    </Card>
  )
}

/**
 * Card for printing the description
 * 
 * @returns Card with the requirement description
 */
export function DescriptionCard() {

  const requirement = useSelector(state => state.requirement.requirement)

  return (
    <Card>
      <Card.Header as="h3">Description</Card.Header>
      <Card.Body>
        <ReactMarkdown className="card-text">{requirement.description}</ReactMarkdown>
      </Card.Body>
    </Card>
  )
}

/**
 * Card for printing the requirement extras
 * 
 * @returns Card with the requirement extras
 */
export function ExtraCard() {

  const requirement = useSelector(state => state.requirement.requirement)

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
    <Card>
      <Card.Header as="h3">Extras</Card.Header>
      <Card.Body>
        {[...requirement.extras].map(extra => (<span key={extra.id} ><Card.Title>{extra.extraType.title}</Card.Title>{printExtraWithType(extra.extraType.extraType, extra.content)}</span>))}
      </Card.Body>
    </Card>
  )
}

/**
 * Card for printing the requirement comments
 * 
 * @returns Card with the requirement comments
 */
export function CommentCard() {

  const requirement = useSelector(state => state.requirement.requirement)
  const roles = useSelector(state => state.user.roles)
  const [showCompleted, setShowCompleted] = useState(false);

  const completedCount = [...requirement.comments].filter((el) => el.completed == true).length

  if (roles.includes(appRoles.Comments.Reader) || roles.includes(appRoles.Comments.Writer)) {
    return (
      <Card>
        <Card.Header as="h3">Comments</Card.Header>
        <Card.Body>
          {completedCount > 0 ? <Form.Check type="switch" id="completed" defaultChecked={showCompleted} onChange={e => { setShowCompleted(e.target.checked) }} label={`${completedCount} comments completed. Show completed`} reverse /> : null}
          {roles.includes(appRoles.Comments.Reader) ? [...requirement.comments].sort((a, b) => a.id - b.id).map((item, commentIndex) => <CommentEntry view={"requirement"} rowIndex={null} commentIndex={commentIndex} comment={item} key={`comment-${commentIndex}`} showCompleted={showCompleted} />) : null}
          {roles.includes(appRoles.Comments.Writer) ? <><Card.Title>Add Comment</Card.Title><AddComment view={"requirement"} index={null} requirementId={requirement["id"]} /></> : null}
        </Card.Body>
      </Card>
    )
  }
}