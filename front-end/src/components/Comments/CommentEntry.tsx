import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useState } from "react";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toast } from "../../stateSlices/NotificationToastSlice";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";

import { appRoles } from '../../authConfig';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { removeComment, updateComment } from '../../stateSlices/CommentSlice';
import { Item as Comment, Item } from '../../types/API/Comments';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../../APIClient';
import { APISuccessData } from '../../types/Generics';
import { toISOStringWithTimezone } from '../MiniComponents';

type Props = {
  index: number;
  comment: Comment;
  showCompleted: boolean;
  setReply: (a: Item|null) => void;
}

/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: author, comment, timestamp
 * @returns A comment entry
 */
export default function CommentEntry({ index, comment, showCompleted, setReply }: Props) {
  const dispatch = useAppDispatch()

  const roles = useAppSelector(state => state.user.roles)
  const comments = useAppSelector(state => state.comment.comments)

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);
  const [cascade, setCascade] = useState(false);


  function deleteComment() {
    const parameters = []
    if (force) {
      parameters.push("force=true")
      if (cascade) {
        parameters.push("cascade=true")
      }
    }
    dispatch(showSpinner(true))
    APIClient.delete(`comments/${comment.id}?${parameters.join("&")}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
      setShowDeleteModal(false)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
      setShowDeleteModal(false)
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Comment deleted", body: "Comment successfully deleted" }))
      dispatch(removeComment({ index, force }))
    }
  }

  function toggleComplete() {
    dispatch(showSpinner(true))
    APIClient.patch(`comments/${comment.id}`, { ...comment, completed: !comment.completed }).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Comment marked as completed", body: "Comment successfully marked as completed" }))
        dispatch(updateComment({ index: index, comment: response.data as Comment }))
    }
  }

  if (!comment.completed || showCompleted) {
    return (
      <>
        <Card id={`comment-${comment.id}`} style={{ marginBottom: '0.5em', lineHeight: '1em' }} border={comment.completed ? "danger" : undefined}>
          <Card.Header style={{ padding: '0em' }}>
            <Stack direction="horizontal" gap={2}>
              <span className="p-2">From <span style={{ fontStyle: 'italic' }}>{comment.author.email}</span></span>
              <span className="ms-auto text-muted" style={{ justifyContent: 'left' }}>at {toISOStringWithTimezone(new Date(comment.created * 1000))}</span>
              {roles.includes(appRoles.Comments.Moderator) ?
                <>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="delete-tooltip">Delete comment</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0em' }} size='sm' onClick={() => { setShowDeleteModal(true) }}><FontAwesomeIcon icon={"eraser"} /></Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="edit-tooltip">Edit comment</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0.05em' }} size='sm' disabled><FontAwesomeIcon icon={"pen"} /></Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="complete-tooltip">Mark as {comment.completed ? "to do" : "completed"}</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0.05em' }} size='sm' onClick={() => { toggleComplete() }}><FontAwesomeIcon icon={"check"} /></Button>
                  </OverlayTrigger>
                </> : null}
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="reply-tooltip">Reply</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0.05em' }} size='sm' onClick={() => { setReply(comment) }}><FontAwesomeIcon icon={"reply"} /></Button>
                  </OverlayTrigger>
              <span></span>
            </Stack>
          </Card.Header>
          <Card.Body style={{ padding: '0.5em' }}>
            <Card.Text style={{ whiteSpace: "pre-line" }}>{comment.comment}</Card.Text>
            {comments.map((item, childIndex) => item.parentId == comment.id ? <CommentEntry index={childIndex} comment={item} key={`comment-${childIndex}`} showCompleted={showCompleted} setReply={setReply}/> : null)}
          </Card.Body>
        </Card>
        {
          showDeleteModal ? <DeleteConfirmationModal
            show={showDeleteModal}
            titleItem="the selected comment"
            item={comment.comment}
            onCancel={() => setShowDeleteModal(false)} onConfirm={() => deleteComment()}
            onForceChange={e => setForce(e)} force={force}
            needCascade={false} onCascadeChange={e => setCascade(e)}
          ></DeleteConfirmationModal> : null
        }
      </>
    );
  }
}
