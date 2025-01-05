import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import { removeToast } from "../stateSlices/NotificationToastSlice";
import { ErrorMessage } from './MiniComponents';
import { useAppSelector, useAppDispatch } from "../hooks";


/**
 * Returns a notification toast container for status messages
 * 
 * @returns Returns a notification toast container
 */
export default function NotificationToast() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector(state => state.notificationToast.toasts)

  return (
    <ToastContainer
      className="p-3"
      position="top-center"
      style={{ zIndex: 9999, position: "fixed" }}
    >
      {toasts.map((toast, index) => (
      <Toast key={`toast-${index}`} onClose={() => {dispatch(removeToast(index))}} show={true} autohide delay={3000}>
        <Toast.Header>
          <strong className="me-auto">{toast.header}</strong>
        </Toast.Header>
        <Toast.Body>
          {ErrorMessage(toast.body)}
        </Toast.Body>
      </Toast>
      ))}
    </ToastContainer>
  );
}
