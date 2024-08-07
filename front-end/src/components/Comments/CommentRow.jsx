import { Button } from "react-bootstrap";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { inSearchField } from "../MiniComponents";
import { removeComment } from "../../stateSlices/CommentSlice";
import { useDispatch } from 'react-redux'
import { toast } from "../../stateSlices/NotificationToastSlice";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { Link } from "react-router-dom";

import { protectedResources } from "../../authConfig";
import useFetchWithMsal from '../../hooks/useFetchWithMsal';


/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: comment, showDeleteModal, setShowDeleteModal, setForce, handleDeleteItem
 * @returns Table row for editing an object
 */
export function CommentRow({ index, comment, search, searchFields, showDeleteModal, setShowDeleteModal, setForce }) {
  const dispatch = useDispatch()

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

  if (inSearchField(search, searchFields, comment)) {
    return (
      <tr>
        <td>{comment.id}</td>
        <td>{comment.comment}</td>
        <td>{comment.author}</td>
        <td><Button variant="primary" as={Link} to={`/Browse/Requirement/${comment.requirement.id}`}>{comment.requirement.title}</Button></td>
        <td><Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button></td>
        {showDeleteModal ? <DeleteConfirmationModal
          show={showDeleteModal}
          item={comment.comment}
          onCancel={() => setShowDeleteModal(false)} onConfirm={() => deleteComment()}
          onForceChange={e => setForce(e)}
        ></DeleteConfirmationModal> : null}
      </tr>
    );
  } else {
    return null
  }
}
