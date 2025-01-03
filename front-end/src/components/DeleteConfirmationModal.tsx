import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';


type Props = {
  titleItem?: string|null;
  item: string;
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onForceChange: (a: boolean) => void;
  force: boolean;
  needCascade: boolean;
  onCascadeChange: (a: boolean) => void;
}

/**
 * Component for a confirmation modal when deleting objects
 * 
 * @param {object} props Props for this component: item, show, onCancel, onConfirm, onForceChange
 * @returns A modal to confirm deletion
 */
export default function DeleteConfirmationModal({ titleItem = null, item, show, onCancel, onConfirm, onForceChange, force, needCascade, onCascadeChange }: Props) {
  if (titleItem === null) {
    titleItem = item
  }
  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="delete-confirmation-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="delete-confirmation-modal">
          Delete {titleItem}?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <p>Are you sure you want to delete <code>{item}</code>?</p>
      </Modal.Body>
      <Modal.Footer>
      <Form.Check
            inline
            type="checkbox"
            id="force"
            label="Force deletion"
            onChange={e => onForceChange(e.target.checked)}
          />
          { needCascade ? <Form.Check
            inline
            type="checkbox"
            id="cascade"
            label="Cascade deletion"
            onChange={e => onCascadeChange(e.target.checked)}
            disabled={!force}
          /> : null }
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
