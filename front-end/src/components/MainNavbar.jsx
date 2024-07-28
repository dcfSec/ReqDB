import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { MainLogoSpinner } from './MiniComponents';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Link } from 'react-router-dom';

import { useMsal } from "@azure/msal-react";
import { appRoles } from '../authConfig';

import { useSelector, useDispatch } from 'react-redux'
import { toggleDarkMode } from "../stateSlices/UserSlice";

/**
 * Component for the main navigation bar
 * 
 * @returns Returns the main navigation bar container
 */
export default function MainNavbar() {

  const dispatch = useDispatch()
  const darkMode = useSelector(state => state.user.darkMode)
  const roles = useSelector(state => state.user.roles)
  const name = useSelector(state => state.user.name)
  const account = useSelector(state => state.user.account)

  const { instance } = useMsal();

  return (
    <Navbar className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} to="/"><MainLogoSpinner></MainLogoSpinner>ReqDB</Navbar.Brand>
        <Navbar.Toggle aria-controls="mainNavbarCollapse" />
        <Navbar.Collapse id="mainNavbarCollapse">
        <Nav
          className="me-auto my-2 my-lg-0"
          navbarScroll
        >
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          { roles.includes(appRoles.Requirements.Reader) ? <Nav.Link as={Link} to="/browse">Browse</Nav.Link> : null }
          { roles.includes(appRoles.Requirements.Writer) ? 
          <NavDropdown title="Edit" id="navbarScrollingDropdown">
            <NavDropdown.Item as={Link} to="/Edit/Tags">Tags</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Catalogues">Catalogues</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Topics">Topics</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Requirements">Requirements</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/ExtraTypes">ExtraTypes</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/ExtraEntries">ExtraEntries</NavDropdown.Item>
          </NavDropdown>
          : null }
        </Nav>
      </Navbar.Collapse>
      <Navbar.Collapse className="justify-content-end">
      <Navbar.Text className="justify-content-end"><Button variant="outline-secondary" onClick={() => {dispatch(toggleDarkMode())}}><FontAwesomeIcon icon={darkMode ? solid("sun") : solid("moon")} /></Button></Navbar.Text>
        <Navbar.Text className='navbar-signed-in-text'>Signed in as:</Navbar.Text>
          <NavDropdown title={name} id="accountDropdown">
          { account ? <NavDropdown.Item onClick={() => {instance.logoutRedirect()}}>Logout</NavDropdown.Item> : <NavDropdown.Item onClick={() => {instance.loginRedirect()}}>Login</NavDropdown.Item> }
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
