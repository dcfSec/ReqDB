import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import { useSelector, useDispatch } from 'react-redux'
import { showToast } from "../stateSlices/NotificationToastSlice";
import { ErrorMessage } from './MiniComponents';


/**
 * Returns a notification toast container for status messages
 * 
 * @returns Returns a notification toast container
 */
export default function NotificationToast() {
  const dispatch = useDispatch()
  const visible = useSelector(state => state.notificationToast.visible)
  const header = useSelector(state => state.notificationToast.header)
  const body = useSelector(state => state.notificationToast.body)

  let htmlBody = <></>

  htmlBody = ErrorMessage(body)

  function close() {
    dispatch(showToast(false))
  }

  return (
    <ToastContainer
      className="p-3"
      position="top-center"
      style={{ zIndex: 9999 }}
    >
      <Toast onClose={close} show={visible} autohide delay={3000}>
        <Toast.Header>
          <strong className="me-auto">{header}</strong>
        </Toast.Header>
        <Toast.Body>
          {htmlBody}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
