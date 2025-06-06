import { Col, Container, Image, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppSelector } from "../hooks";

/**
 * Parent component for all views
 * 
 * @returns Main layout
 */
export default function Footer() {
  const darkMode = useAppSelector(state => state.user.preferences.darkMode)

  return (
    <>
      <Container fluid className="bg-footer">
        <Row className="justify-content-md-center bg-body-tertiary footer">
          <Col><p className="footer-col text-center"><a href="https://github.com/dcfSec/ReqDB">made by <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-dcfSec">dcfSec</Tooltip>}><Image className="smallLogo" src={darkMode ? "/dcfSecLogoInverse.svg" : "/dcfSecLogo.svg"} /></OverlayTrigger> code on <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-github">GitHub</Tooltip>}><FontAwesomeIcon icon={["fab", "github"]} /></OverlayTrigger></a></p></Col>
        </Row>
      </Container>
    </>
  )
};
