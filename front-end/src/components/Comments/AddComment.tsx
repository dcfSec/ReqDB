import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';
import { useState } from "react";
import { useDispatch } from 'react-redux'
import { addComment } from '../../stateSlices/BrowseSlice';
import { addCommentToRequirement } from '../../stateSlices/RequirementSlice';

import { toast } from "../../stateSlices/NotificationToastSlice";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";

import useFetchWithMsal from "../../hooks/useFetchWithMsal";
import { protectedResources } from "../../authConfig";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";


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

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  if (error) {
    dispatch(toast({ header: "UnhandledError", body: error.message }))
    dispatch(showSpinner(false))
  }

  function postComment() {
    execute("POST", `comments`, { comment: newComment, requirementId }).then(
      (response) => {
        if (response.status === 200) {
          if (view == "browse") {
            dispatch(addComment({ index, comment: response.data }))
          } else if (view == "requirement") {
            dispatch(addCommentToRequirement({ comment: response.data }))
          }
          dispatch(toast({ header: "Comment added", body: "Comment successfully added" }))
          setNewComment("")
        } else {
          dispatch(toast({ header: response.error, body: response.message }))
        }
        dispatch(showSpinner(false))
      },
      (error) => {
        dispatch(toast({ header: "UnhandledError", body: error.message }))
        dispatch(showSpinner(false))
      }
    )
  }

  return (
    <Stack direction="horizontal" gap={3}>
      <Form.Control as="textarea" className="me-auto" id="description" value={newComment} onChange={e => { setNewComment(e.target.value) }}></Form.Control>
      <Button variant="primary" onClick={() => postComment()}><FontAwesomeIcon icon={solid("paper-plane")} /></Button>
    </Stack>
  );
}
