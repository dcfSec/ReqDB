import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useTranslation } from 'react-i18next';


type Props = {
  titleItem?: string | null;
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
  const { t } = useTranslation();
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
          {t('deleteConfirmation.title', { item: titleItem })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('deleteConfirmation.bodyPrefix')} <code>{item}</code>?</p>
      </Modal.Body>
      <Modal.Footer>
        <Form.Check
          inline
          type="checkbox"
          id="force"
          label={t('deleteConfirmation.force')}
          onChange={e => onForceChange(e.target.checked)}
        />
        {needCascade ? <Form.Check
          inline
          type="checkbox"
          id="cascade"
          label={t('deleteConfirmation.cascade')}
          onChange={e => onCascadeChange(e.target.checked)}
          disabled={!force}
        /> : null}
        <Button variant="danger" onClick={onConfirm}>{t('buttons.confirm')}</Button>
        <Button variant="secondary" onClick={onCancel}>{t('buttons.cancel')}</Button>
      </Modal.Footer>
    </Modal>
  );
}
