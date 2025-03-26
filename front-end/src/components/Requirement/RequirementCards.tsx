import { Badge, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Markdown from 'react-markdown'
import { appRoles } from '../../authConfig';
import ExtraField from "../Browse/ExtraField";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { Item as Topic } from "../../types/API/Topics";
import CommentsBase from "../Comments/CommentsBase";
import { setComments, setRequirementId } from "../../stateSlices/CommentSlice";

/**
 * Card for listing the tags
 * 
 * @returns Card for listing the tags
 */
export function TagsCard() {

  const requirement = useAppSelector(state => state.requirement.requirement)

  const tags = requirement ? [ ...requirement.tags] : []

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
  const parent = requirement ? buildTopicsList({...requirement.parent}).map(topic => (<span key={topic}>{' '}<FontAwesomeIcon icon={"arrow-right"} />{' '}<Badge bg="secondary">{topic}</Badge></span>)) : ""

  function buildTopicsList(topic: Topic) {
    let r = [topic.title]
    if (topic.parentId !== null) {
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
        <Markdown className="card-text">{description}</Markdown>
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
  
  const comments = requirement ? [...requirement.comments] : []

  if (roles.includes(appRoles.Comments.Reader) || roles.includes(appRoles.Comments.Writer)) {

    const dispatch = useAppDispatch()
    dispatch(setComments(comments))
    dispatch(setRequirementId(requirement ? requirement.id : undefined))

    return (
      <Card>
        <Card.Header as="h3">Comments</Card.Header>
        <Card.Body>
          <CommentsBase />
        </Card.Body>
      </Card>
    )
  }
}