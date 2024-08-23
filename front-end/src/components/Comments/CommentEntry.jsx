import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { toast } from "../../stateSlices/NotificationToastSlice";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";

import useFetchWithMsal from "../../hooks/useFetchWithMsal";
import { protectedResources } from "../../authConfig";
import { appRoles } from '../../authConfig';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { removeComment, updateComment } from '../../stateSlices/BrowseSlice';
import { removeCommentFromRequirement, updateCommentInRequirement } from '../../stateSlices/RequirementSlice';


/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: author, comment, timestamp
 * @returns A comment entry
 */
export default function CommentEntry({ view, rowIndex, commentIndex, comment, showCompleted }) {
  const dispatch = useDispatch()

  const roles = useSelector(state => state.user.roles)

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  if (error) {
    dispatch(toast({ header: "UnhandledError", body: error.message }))
    dispatch(showSpinner(false))
  }

  function deleteComment() {
    dispatch(showSpinner(true))
    execute("DELETE", `comments/${comment.id}`, null, false).then(
      (response) => {
        if (response.status === 204) {
          dispatch(toast({ header: "Comment deleted", body: "Comment successfully deleted" }))
          if (view == "browse") {
            dispatch(removeComment({ index: rowIndex, comment: commentIndex }))
          } else if (view == "requirement") {
            dispatch(removeCommentFromRequirement({ comment: commentIndex }))
          }
        } else {
          response.json().then((r) => {
            dispatch(toast({ header: r.error, body: r.message }))
          }
          );
        }
        dispatch(showSpinner(false))
        setShowDeleteModal(false)
      },
      (error) => {
        dispatch(toast({ header: "UnhandledError", body: error.message }))
        dispatch(showSpinner(false))
        setShowDeleteModal(false)
      }
    )
  }

  function toggleComplete() {
    dispatch(showSpinner(true))
    execute("PUT", `comments/${comment.id}`, { ...comment, completed: !comment.completed }).then(
      (response) => {
        if (response.status === 200) {
          dispatch(toast({ header: "Comment marked as completed", body: "Comment successfully marked as completed" }))
          if (view == "browse") {
            dispatch(updateComment({ index: rowIndex, commentIndex, comment: response.data }))
          } else if (view == "requirement") {
            dispatch(updateCommentInRequirement({ index: commentIndex, comment: response.data }))
          }
        } else {
          response.json().then((r) => {
            dispatch(toast({ header: r.error, body: r.message }))
          }
          );
        }
        dispatch(showSpinner(false))
        setShowDeleteModal(false)
      },
      (error) => {
        dispatch(toast({ header: "UnhandledError", body: error.message }))
        dispatch(showSpinner(false))
        setShowDeleteModal(false)
      }
    )
  }

  if (!comment.completed || showCompleted) {
    return (
      <>
        <Card style={{ marginBottom: '0.5em', lineHeight: '1em' }} border={comment.completed ? "danger" : null}>
          <Card.Header style={{ padding: '0em' }}>
            <Stack direction="horizontal" gap={2}>
              <span className="p-2">From <span style={{ fontStyle: 'italic' }}>{comment.author}</span></span>
              <span className="ms-auto text-muted" style={{ justifyContent: 'left' }}>at {new Date(comment.created).toLocaleString()}</span>
              {roles.includes(appRoles.Comments.Moderator) ?
                <>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="delete-tooltip">Delete comment</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0em' }} size='sm' onClick={() => { setShowDeleteModal(true) }}><FontAwesomeIcon icon={solid("eraser")} /></Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="edit-tooltip">Edit comment</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0.05em' }} size='sm' disabled><FontAwesomeIcon icon={solid("pen")} /></Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="edit-tooltip">Mark as {comment.completed ? "to do" : "completed"}</Tooltip>}>
                    <Button variant="outline-secondary" style={{ height: '1.5rem', width: '1.5rem', padding: '0.05em' }} size='sm' onClick={() => { toggleComplete() }}><FontAwesomeIcon icon={solid("check")} /></Button>
                  </OverlayTrigger>
                </> : null}
              <span></span>
            </Stack>
          </Card.Header>
          <Card.Body style={{ padding: '0.5em' }}>
            <Card.Text style={{whiteSpace: "pre-line"}}>{comment.comment}</Card.Text>
          </Card.Body>
        </Card>
        {
          showDeleteModal ? <DeleteConfirmationModal
            show={showDeleteModal}
            titleItem="the selected comment"
            item={comment.comment}
            onCancel={() => setShowDeleteModal(false)} onConfirm={() => deleteComment()}
            onForceChange={e => setForce(e)}
          ></DeleteConfirmationModal> : null
        }
      </>
    );
  }
}
