import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

export default function NotificationToast(props) {
  const { close, show, header, body} = props
  let htmlBody = <></>

  if (Array.isArray(body)) {
    htmlBody = <>{body.map((item, index) => (
      <p key={index}>{item}</p>
      ))}</>
  } else {
    htmlBody = <>{body}</>

  }

  return (
      <ToastContainer
          className="p-3"
          position="top-center"
          style={{ zIndex: 1 }}
        >
      <Toast onClose={close} show={show} autohide delay={3000}>
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
