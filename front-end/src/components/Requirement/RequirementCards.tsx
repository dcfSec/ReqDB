import { Badge, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { appRoles } from '../../authConfig';
import { useState } from "react";
import CommentEntry from "../Comments/CommentEntry";
import AddComment from "../Comments/AddComment";
import ExtraField from "../Browse/ExtraField";
import { useAppSelector } from "../../hooks";
import { Item as Topic } from "../../types/API/Topics";

/**
 * Card for listing the tags
 * 
 * @returns Card for listing the tags
 */
export function TagsCard() {

  const requirement = useAppSelector(state => state.requirement.requirement)

  const tags = requirement ? { ...requirement.tags} : []

  return (
    <Card>
      <Card.Header as="h3">Tags</Card.Header>
      <Card.Body>
        <Card.Text>{tags.map(tag => (<span key={tag.id}><Badge bg="secondary">{tag.name}</Badge>{' '}</span>))}</Card.Text>
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

  const requirement = useAppSelector(state => state.requirement.requirement)
  const parent = requirement ? buildTopicsList({...requirement.parent}).map(topic => (<span key={topic}>{' '}<FontAwesomeIcon icon={solid("arrow-right")} />{' '}<Badge bg="secondary">{topic}</Badge></span>)) : ""

  function buildTopicsList(topic: Topic) {
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
        <Card.Text>{parent}</Card.Text>
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

  const requirement = useAppSelector(state => state.requirement.requirement)
  const description = requirement ? requirement.description : ""

  return (
    <Card>
      <Card.Header as="h3">Description</Card.Header>
      <Card.Body>
        <ReactMarkdown className="card-text">{description}</ReactMarkdown>
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

  const requirement = useAppSelector(state => state.requirement.requirement)
  const extras = requirement ? [...requirement.extras] : []

  return (
    <Card>
      <Card.Header as="h3">Extras</Card.Header>
      <Card.Body>
        {extras.map(extra => (<span key={extra.id} ><Card.Title>{extra.extraType.title}</Card.Title><ExtraField index={0} extraType={extra.extraType.extraType} item={extra.content} lineBreak={false}/></span>))}
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

  const requirement = useAppSelector(state => state.requirement.requirement)
  const roles = useAppSelector(state => state.user.roles)
  const [showCompleted, setShowCompleted] = useState(false);
  
  const comments = requirement ? [...requirement.comments] : []
  const id = requirement ? requirement.id : NaN

  const completedCount = comments.filter((el) => el.completed == true).length

  if (roles.includes(appRoles.Comments.Reader) || roles.includes(appRoles.Comments.Writer)) {
    return (
      <Card>
        <Card.Header as="h3">Comments</Card.Header>
        <Card.Body>
          {completedCount > 0 ? <Form.Check type="switch" id="completed" defaultChecked={showCompleted} onChange={e => { setShowCompleted(e.target.checked) }} label={`${completedCount} comments completed. Show completed`} reverse /> : null}
          {roles.includes(appRoles.Comments.Reader) ? comments.sort((a, b) => a.id - b.id).map((item, commentIndex) => <CommentEntry view={"requirement"} rowIndex={0} commentIndex={commentIndex} comment={item} key={`comment-${commentIndex}`} showCompleted={showCompleted} />) : null}
          {roles.includes(appRoles.Comments.Writer) ? <><Card.Title>Add Comment</Card.Title><AddComment view={"requirement"} index={0} requirementId={id} /></> : null}
        </Card.Body>
      </Card>
    )
  }
}