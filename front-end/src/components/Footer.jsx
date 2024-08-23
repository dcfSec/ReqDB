import { Col, Container, Image, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { brands } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useSelector } from 'react-redux'

/**
 * Parent component for all views
 * 
 * @returns Main layout
 */
export default function Footer() {
  const darkMode = useSelector(state => state.user.darkMode)

  return (
    <>
      <Container fluid className="bg-footer">
        <Row className="justify-content-md-center bg-body-tertiary footer">
          <Col><p className="footer-col text-center"><a href="https://github.com/dcfSec/ReqDB">made by <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-dcfSec">dcfSec</Tooltip>}><Image className="smallLogo" src={darkMode ? "/dcfSecLogoInverse.svg" : "/dcfSecLogo.svg"} /></OverlayTrigger> code on <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-github">GitHub</Tooltip>}><FontAwesomeIcon icon={brands("github")} /></OverlayTrigger></a></p></Col>
        </Row>
      </Container>
    </>
  )
};
