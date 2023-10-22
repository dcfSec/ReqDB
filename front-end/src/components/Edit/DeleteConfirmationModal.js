import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

/**
 * Component for a confirmation modal when deleting objects
 * 
 * @param {object} props Props for this component: item, show, onCancel, onConfirm, onForceChange
 * @returns A modal to confirm delection
 */
export default function DeleteConfirmationModal(props) {
  const { item, show, onCancel, onConfirm, onForceChange } = props
  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Delete {item}?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <p>Are you shure you want to delete "{item}"?</p>
      </Modal.Body>
      <Modal.Footer>
      <Form.Check
            type="checkbox"
            id="force"
            label="Force deletion"
            onChange={e => onForceChange(e.target.checked)}
          />
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
