import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import CommentsBase from './CommentsBase';
import { reset } from '../../stateSlices/CommentSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setComments } from '../../stateSlices/BrowseSlice';


type Props = {
  requirementIndex: number;
  title: string;
  show: boolean;
  setShow: (a: boolean) => void;
}

/**
 * Component for a modal to view and add comments
 * 
 * @param {object} props Props for this component: humanKey, show, setShow, initialSelectedItems, endpoint, columns, updateKey, updateItem
 * @returns Returns a modal to select many
 */
export default function CommentModal({ requirementIndex, title, show, setShow }: Props) {
  const dispatch = useAppDispatch()

  const comments = useAppSelector(state => state.comment.comments)

  function close() {
    dispatch(setComments({ index: requirementIndex, comments }))
    dispatch(reset())
    setShow(false)
  }

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      onHide={() => { close() }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Comments for <code>{title}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CommentsBase />
      </Modal.Body>
      <Modal.Footer>
        <Stack direction="horizontal" gap={3}>
        </Stack>
        <Button variant="secondary" onClick={() => close()}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
