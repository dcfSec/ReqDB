import { Outlet } from "react-router-dom";
import MainNavbar from '../components/MainNavbar';
import NotificationToast from "../components/NotificationToast";
import Footer from "../components/Footer";
import { Container, Row, Col } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";

/**
 * Parent component for all views
 * 
 * @returns Main layout
 */
export default function Layout() {

  return (
    <>
      <MainNavbar />
      <Container fluid className="bg-body">
        <Row>
          <Col><MainBreadcrumb /></Col>
        </Row>
        <Outlet />
      </Container>
      <Footer />
      <NotificationToast />
    </>
  )
};
