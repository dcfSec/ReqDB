import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Alert, Form } from 'react-bootstrap';
import { useState } from "react";
import { addComment } from '../../stateSlices/CommentSlice';

import { toast } from "../../stateSlices/NotificationToastSlice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import APIClient, { handleError, handleResult } from '../../APIClients';
import { APIErrorData, APISuccessData } from '../../types/Generics';
import { Item as Comment } from "../../types/API/Comments";
import { showSpinner } from '../../stateSlices/MainLogoSpinnerSlice';
import { truncate } from '../MiniComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';


type Props = {
  replyTo: Comment | null;
  replyToText: string;
  setReply: (a: Comment | null) => void;
}

/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, requirementId
 * @returns A comment entry
 */
export default function AddComment({ replyTo = null, replyToText = "", setReply }: Props) {
  const dispatch = useAppDispatch()


  const requirementId = useAppSelector(state => state.comment.requirementId)

  const [newComment, setNewComment] = useState("")

  function postComment() {
    dispatch(showSpinner(true))
    APIClient.post(`comments`, { comment: newComment, requirementId, parentId: replyTo ? replyTo.id : null }).then((response) => {
      handleResult(response, okCallback, APIErrorCallback)
    }).catch((error) => {
      handleError(error, APIErrorCallback, errorCallback)
    });
  }

  function okCallback(response: APISuccessData) {
    dispatch(addComment({ comment: response.data as Comment }))
    dispatch(toast({ header: "Comment added", body: "Comment successfully added" }))
    setNewComment("")
    setReply(null)
  }

  function APIErrorCallback(response: APIErrorData) {
    dispatch(toast({ header: response.error, body: response.message as string }))
  }

  function errorCallback(error: string) {
    dispatch(toast({ header: "UnhandledError", body: error }))
  }

  return (
    <>
      {replyTo != null ? <Alert variant="info" style={{ marginBottom: "0.5rem", padding: "0.2rem" }}>
        <Stack direction="horizontal" gap={3}>
          <span>Replying to: <span style={{ fontStyle: "italic" }}>{truncate(replyToText, 100)}</span></span>
          <Button className="ms-auto" variant="link" size='sm' onClick={() => setReply(null)}><FontAwesomeIcon icon={"xmark"} /></Button>
        </Stack>
      </Alert> : null}
      <Stack direction="horizontal" gap={3}>
        <Form.Control as="textarea" className="me-auto" id="description" value={newComment} onChange={e => { setNewComment(e.target.value) }}></Form.Control>
        <Button variant="primary" onClick={() => postComment()}><FontAwesomeIcon icon={"paper-plane"} /></Button>
      </Stack>
    </>
  );
}
