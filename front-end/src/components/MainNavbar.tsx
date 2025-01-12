import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { MainLogoSpinner } from './MiniComponents';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Link } from 'react-router-dom';
import { appRoles } from '../authConfig';

import { useAppSelector, useAppDispatch } from "../hooks";
import { toggleDarkMode } from "../stateSlices/UserSlice";
import { useState } from 'react';
import RolesModal from './RolesModal';
import Preferences from './Preferences';
import { useAuth } from 'react-oidc-context';
import { ReactNode } from 'react';
import ConfigurationModal from './ConfigurationModal';

/**
 * Component for the main navigation bar
 * 
 * @returns Returns the main navigation bar container
 */
export default function MainNavbar() {


  const [showRoles, setShowRoles] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showConfiguration, setShowConfiguration] = useState(false)

  const auth = useAuth();

  if (auth.isAuthenticated) {

    const roles = useAppSelector(state => state.user.roles)
    const name = useAppSelector(state => state.user.name)

    return <MainNavbarParent showRoles={showRoles} setShowRoles={setShowRoles} showPreferences={showPreferences} setShowPreferences={setShowPreferences} showConfiguration={showConfiguration} setShowConfiguration={setShowConfiguration}>
      <MainNavbarLeftParent>
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
      </MainNavbarLeftParent>
      <MainNavbarRightParent>
        <NavDropdown title={name} id="accountDropdown" align="end">
          {auth.isAuthenticated ?
            <>
              <NavDropdown.Item onClick={() => { setShowRoles(true) }}>My Roles</NavDropdown.Item>
              <NavDropdown.Item onClick={() => { setShowPreferences(true) }}>Preferences</NavDropdown.Item>
            {roles.includes(appRoles.Configuration.Reader) ?
              <NavDropdown.Item onClick={() => { setShowConfiguration(true) }}>Configuration</NavDropdown.Item>
              : null}
              <NavDropdown.Item onClick={() => void auth.removeUser()}>Logout</NavDropdown.Item>
            </> :
            <NavDropdown.Item onClick={() => void auth.signinRedirect()}>Login</NavDropdown.Item>
          }
        </NavDropdown>
      </MainNavbarRightParent>
    </MainNavbarParent>


  } else {
    return <MainNavbarParent showRoles={showRoles} setShowRoles={setShowRoles} showPreferences={showPreferences} setShowPreferences={setShowPreferences} showConfiguration={showConfiguration} setShowConfiguration={setShowConfiguration}>
      <MainNavbarLeftParent />
      <MainNavbarRightParent>
        <NavDropdown title={"Nobody"} id="accountDropdown" align="end">
          <NavDropdown.Item onClick={() => void auth.signinRedirect()}>Login</NavDropdown.Item>
        </NavDropdown>
      </MainNavbarRightParent>
    </MainNavbarParent>
  }

}


interface MainNavbarParentProps {
  children: ReactNode;
  showRoles: boolean;
  setShowRoles: (show: boolean) => void;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  showConfiguration: boolean;
  setShowConfiguration: (show: boolean) => void;
}

function MainNavbarParent({ children, showRoles, setShowRoles, showPreferences, setShowPreferences, showConfiguration, setShowConfiguration }: MainNavbarParentProps) {

  return <Navbar className="bg-body-tertiary">
    <Container fluid>
      <Navbar.Brand as={Link} to="/"><MainLogoSpinner></MainLogoSpinner>ReqDB</Navbar.Brand>
      <Navbar.Toggle aria-controls="mainNavbarCollapse" />
      {children}

    </Container>
    {showRoles ? <RolesModal show={showRoles} setShow={setShowRoles} /> : null}
    <Preferences show={showPreferences} setShow={setShowPreferences} />
    <ConfigurationModal show={showConfiguration} setShow={setShowConfiguration} />
  </Navbar>
}

function MainNavbarLeftParent({ children }: { children?: ReactNode; }) {
  return <Navbar.Collapse id="mainNavbarCollapse">
    <Nav
      className="me-auto my-2 my-lg-0"
      navbarScroll
    >
      <Nav.Link as={Link} to="/">Home</Nav.Link>
      {children}
    </Nav>
  </Navbar.Collapse>
}

function MainNavbarRightParent({ children }: { children?: ReactNode; }) {
  const dispatch = useAppDispatch()
  const darkMode = useAppSelector(state => state.user.preferences.darkMode)
  return <Navbar.Collapse className="justify-content-end">
    <Navbar.Text className="justify-content-end"><Button variant="outline-secondary" onClick={() => { dispatch(toggleDarkMode()) }}><FontAwesomeIcon icon={darkMode ? solid("sun") : solid("moon")} /></Button></Navbar.Text>
    <Navbar.Text className='navbar-signed-in-text'>Signed in as:</Navbar.Text>
    {children}
  </Navbar.Collapse>
}