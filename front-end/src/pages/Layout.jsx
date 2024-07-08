import { Outlet } from "react-router-dom";
import MainNavbar from '../components/MainNavbar';
import NotificationToast from "../components/NotificationToast";
import { Col, Container, Image, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { brands } from "@fortawesome/fontawesome-svg-core/import.macro";

/**
 * Parent component for all views
 * 
 * @param {object} props Props for this component: darkMode, setDarkMode
 * @returns Main layout
 */
export default function Layout({ darkMode, setDarkMode }) {
  return (
    <>
      <MainNavbar darkMode={darkMode} setDarkMode={setDarkMode}></MainNavbar>
      <Outlet />
      <Container fluid className="bg-footer">
        <Row className="justify-content-md-center bg-body-tertiary footer">
          <Col><p className="footer-col text-center"><a href="https://github.com/dcfSec/ReqDB">made by <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-dcfSec">dcfSec</Tooltip>}><Image className="smallLogo" src={darkMode ? "/dcfSecLogoInverse.svg" : "/dcfSecLogo.svg"} /></OverlayTrigger> code on <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-github">GitHub</Tooltip>}><FontAwesomeIcon icon={brands("github")} /></OverlayTrigger></a></p></Col>
        </Row>
      </Container>
      <NotificationToast />
    </>
  )
};
