import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';
import { useState } from "react";
import { useDispatch } from 'react-redux'
import { addComment } from '../../stateSlices/BrowseSlice';
import { addCommentToRequirement } from '../../stateSlices/RequirementSlice';

import { toast } from "../../stateSlices/NotificationToastSlice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import APIClient, { handleError, handleResult } from '../../APIClient';
import { APIErrorData, APISuccessData } from '../../types/Generics';
import { Item as Comment } from "../../types/API/Comments";
import { showSpinner } from '../../stateSlices/MainLogoSpinnerSlice';


type Props = {
  view: string;
  index: number;
  requirementId: number
}

/**
 * Component for a row in the brows view with the possible interactions
 * 
 * @param {object} props Props for this component: index, requirementId
 * @returns A comment entry
 */
export default function AddComment({ view, index, requirementId }: Props) {
  const dispatch = useDispatch()

  const [newComment, setNewComment] = useState("")

  function postComment() {
    dispatch(showSpinner(true))
    APIClient.post(`comments`, { comment: newComment, requirementId }).then((response) => {
      handleResult(response, okCallback, APIErrorCallback)
    }).catch((error) => {
      handleError(error, APIErrorCallback, errorCallback)
    });
  }

  function okCallback(response: APISuccessData) {
    if (view == "browse") {
      dispatch(addComment({ index, comment: response.data as Comment }))
    } else if (view == "requirement") {
      dispatch(addCommentToRequirement({ comment: response.data as Comment }))
    }
    dispatch(toast({ header: "Comment added", body: "Comment successfully added" }))
    setNewComment("")
  }

  function APIErrorCallback(response: APIErrorData) {
    dispatch(toast({ header: response.error, body: response.message as string }))
  }

  function errorCallback(error: string) {
    dispatch(toast({ header: "UnhandledError", body: error }))
  }

  return (
    <Stack direction="horizontal" gap={3}>
      <Form.Control as="textarea" className="me-auto" id="description" value={newComment} onChange={e => { setNewComment(e.target.value) }}></Form.Control>
      <Button variant="primary" onClick={() => postComment()}><FontAwesomeIcon icon={solid("paper-plane")} /></Button>
    </Stack>
  );
}
