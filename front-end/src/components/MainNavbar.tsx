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

import { useAppSelector, useAppDispatch } from "../hooks";
import { toggleDarkMode } from "../stateSlices/UserSlice";
import { useState } from 'react';
import RolesModal from './RolesModal';
import Preferences from './Preferences';

/**
 * Component for the main navigation bar
 * 
 * @returns Returns the main navigation bar container
 */
export default function MainNavbar() {

  const dispatch = useAppDispatch()
  const darkMode = useAppSelector(state => state.user.preferences.darkMode)
  const roles = useAppSelector(state => state.user.roles)
  const name = useAppSelector(state => state.user.name)
  const account = useAppSelector(state => state.user.account)

  const [showRoles, setShowRoles] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

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
            {roles.includes(appRoles.Requirements.Reader) ? <Nav.Link as={Link} to="/browse">Browse</Nav.Link> : null}
            {roles.includes(appRoles.Comments.Moderator) ? <Nav.Link as={Link} to="/Comments">Comments</Nav.Link> : null}
            {roles.includes(appRoles.Requirements.Writer) ?
              <NavDropdown title="Edit" id="navbarScrollingDropdown">
                <NavDropdown.Item as={Link} to="/Edit/Tags">Tags</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Edit/Catalogues">Catalogues</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Edit/Topics">Topics</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Edit/Requirements">Requirements</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Edit/ExtraTypes">ExtraTypes</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Edit/ExtraEntries">ExtraEntries</NavDropdown.Item>
              </NavDropdown>
              : null}
            {roles.includes(appRoles.Requirements.Auditor) || roles.includes(appRoles.Comments.Auditor) ?
              <NavDropdown title="Audit" id="navbarScrollingDropdown">
                {roles.includes(appRoles.Requirements.Auditor) ? <>
                  <NavDropdown.Item as={Link} to="/Audit/Tags">Tags</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/Audit/Catalogues">Catalogues</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/Audit/Topics">Topics</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/Audit/Requirements">Requirements</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/Audit/ExtraTypes">ExtraTypes</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/Audit/ExtraEntries">ExtraEntries</NavDropdown.Item>
                </> : null}
                {roles.includes(appRoles.Comments.Auditor) ?
                  <NavDropdown.Item as={Link} to="/Audit/Comments">Comments</NavDropdown.Item>
                  : null}
              </NavDropdown>
              : null}
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="justify-content-end"><Button variant="outline-secondary" onClick={() => { dispatch(toggleDarkMode()) }}><FontAwesomeIcon icon={darkMode ? solid("sun") : solid("moon")} /></Button></Navbar.Text>
          <Navbar.Text className='navbar-signed-in-text'>Signed in as:</Navbar.Text>
          <NavDropdown title={name} id="accountDropdown" align="end">
            {account ?
              <>
                <NavDropdown.Item onClick={() => { setShowRoles(true) }}>My Roles</NavDropdown.Item>
                <NavDropdown.Item onClick={() => { setShowPreferences(true) }}>Preferences</NavDropdown.Item>
                <NavDropdown.Item onClick={() => { instance.logoutRedirect() }}>Logout</NavDropdown.Item>
              </> :
              <NavDropdown.Item onClick={() => { instance.loginRedirect() }}>Login</NavDropdown.Item>
            }
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
      <RolesModal show={showRoles} setShow={setShowRoles} />
      <Preferences show={showPreferences} setShow={setShowPreferences} />
    </Navbar>
  );
}
