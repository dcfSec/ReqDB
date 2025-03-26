import { Button } from "react-bootstrap";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { inSearchField } from "../MiniComponents";
import { removeComment, updateComment } from "../../stateSlices/CommentSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { LinkContainer } from 'react-router-bootstrap'
import Form from 'react-bootstrap/Form';
import { useState } from "react";

import { Item } from "../../types/API/Comments";
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from "../../APIClient";
import { APISuccessData } from "../../types/Generics";
import { useAppDispatch } from "../../hooks";

type Props = {
  index: number;
  comment: Item;
  search: string;
  searchFields: Array<string>;
  showCompleted: boolean
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: comment, showDeleteModal, setShowDeleteModal, handleDeleteItem
 * @returns Table row for editing an object
 */
export function CommentRow({ index, comment, search, searchFields, showCompleted }: Props) {
  const dispatch = useAppDispatch()
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

  function updateCompleted(completed: boolean) {
    dispatch(showSpinner(true))
    APIClient.patch(`comments/${comment.id}`, { ...comment, completed: completed }).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Comment marked as completed updated", body: "Comment successfully updated marked as completed" }))
      dispatch(updateComment({ index, comment: response.data }))
    }
  }

  if (inSearchField(search, searchFields, comment) && comment && (!comment.completed || showCompleted)) {
    return (
      <tr>
        <td>{comment.id}</td>
        <td style={{ whiteSpace: "pre-line" }}>{comment.comment}</td>
        <td>{comment.author.email}</td>
        <td><Form.Check type="switch" id="completed" defaultChecked={comment.completed} onChange={e => { updateCompleted(e.target.checked) }} /></td>
        <td><LinkContainer to={`/Browse/Requirement/${comment.requirement.id}`}><Button variant="primary" size="sm">{comment.requirement.title}</Button></LinkContainer></td>
        <td>{comment.parentId}</td>
        <td><Button variant="danger" onClick={() => {setShowDeleteModal(true)}}>Delete</Button></td>
        {showDeleteModal ? <DeleteConfirmationModal
          key={`${comment.id}`}
          show={showDeleteModal}
          item={comment.comment}
          onCancel={() => setShowDeleteModal(false)} onConfirm={() => deleteComment()}
          onForceChange={e => setForce(e)} force={force}
          needCascade={false} onCascadeChange={e => setCascade(e)}
        ></DeleteConfirmationModal> : null}
      </tr>
    );
  } else {
    return null
  }
}
