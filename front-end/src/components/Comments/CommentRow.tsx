import { Button } from "react-bootstrap";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { inSearchField } from "../MiniComponents";
import { removeComment, updateComment } from "../../stateSlices/CommentSlice";
import { useDispatch } from 'react-redux'
import { toast } from "../../stateSlices/NotificationToastSlice";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import {LinkContainer} from 'react-router-bootstrap'
import Form from 'react-bootstrap/Form';
import { useState } from "react";

import { protectedResources } from "../../authConfig";
import useFetchWithMsal from '../../hooks/useFetchWithMsal';
import { Item } from "../../types/API/Comments";

type Props = {
  index:number;
   comment: Item;
   search: string;
   searchFields: Array<string>;
   showDeleteModal: boolean;
   setShowDeleteModal: (a: boolean) => void;
   showCompleted: boolean
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: comment, showDeleteModal, setShowDeleteModal, handleDeleteItem
 * @returns Table row for editing an object
 */
export function CommentRow({ index, comment, search, searchFields, showDeleteModal, setShowDeleteModal, showCompleted }: Props) {
  const dispatch = useDispatch()

  const [force, setForce] = useState(false);
  const [/*cascade*/, setCascade] = useState(false);

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
          dispatch(removeComment({ comment: index }))
        } else {
          response.json().then((r: {error: string, message: string}) => {
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

  function updateCompleted(completed: boolean) {
    dispatch(showSpinner(true))
    execute("PUT", `comments/${comment.id}`, { ...comment, completed: completed }).then(
      (response) => {
        if (response.status === 200) {
          dispatch(toast({ header: "Comment marked as completed updated", body: "Comment successfully updated marked as completed" }))
          dispatch(updateComment({ index, comment: response.data }))
        } else {
          response.json().then((r: {error: string, message: string}) => {
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

  if (inSearchField(search, searchFields, comment) && comment && (!comment.completed || showCompleted)) {
    return (
      <tr>
        <td>{comment.id}</td>
        <td style={{whiteSpace: "pre-line"}}>{comment.comment}</td>
        <td>{comment.author}</td>
        <td><Form.Check type="switch" id="completed" defaultChecked={comment.completed} onChange={e => { updateCompleted(e.target.checked) }} /></td>
        <td><LinkContainer to={`/Browse/Requirement/${comment.requirement.id}`}><Button variant="primary" size="sm">{comment.requirement.title}</Button></LinkContainer></td>
        <td><Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button></td>
        {showDeleteModal ? <DeleteConfirmationModal
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
