import Form from 'react-bootstrap/Form';
import { Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { toggleUserConfiguration } from '../../../stateSlices/UserSlice';


/**
 * Component for notification preferences
 * 
 * @returns The notification preferences card
 */
export function Notifications() {
  const dispatch = useAppDispatch()

  const preferences = useAppSelector(state => state.user.preferences)

  return <Card style={{ marginBottom: "1em" }}>
    <Card.Header as="h4">Notifications (E-Mail)</Card.Header>
    <Card.Body>
      Send an E-Mail when
      <Form.Check type="switch" id="notification-comment-chain-switch" label="someone replies to a comment chain I'm participating in" onChange={(e) => dispatch(toggleUserConfiguration({ id: e.target.id, checked: e.target.checked }))} checked={preferences.notificationMailOnCommentChain} />
      <Form.Check type="switch" id="notification-comment-requirement-switch" label="someone adds a new comment to a requirement" onChange={(e) => dispatch(toggleUserConfiguration({ id: e.target.id, checked: e.target.checked }))} checked={preferences.notificationMailOnRequirementComment} />
    </Card.Body>
  </Card>

}
