import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import { removeToast } from "../stateSlices/NotificationToastSlice";
import { ErrorMessage } from './MiniComponents';
import { useAppSelector, useAppDispatch } from "../hooks";
import { useEffect } from 'react';


/**
 * Returns a notification toast container for status messages
 * 
 * @returns Returns a notification toast container
 */
export default function NotificationToast() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector(state => state.notificationToast.toasts)

  useEffect(() => {
    const timers = toasts.map((_, index) => setTimeout(() => {dispatch(removeToast(index))}, 2500));
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [toasts, dispatch]);

  return (
    <ToastContainer
      className="p-3"
      position="top-center"
      style={{ zIndex: 9999, position: "fixed" }}
    >
      {toasts.map((toast, index) => (
      <Toast key={`toast-${index}`} onClose={() => {dispatch(removeToast(index))}}>
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
