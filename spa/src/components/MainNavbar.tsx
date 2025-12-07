import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { MainLogoSpinner } from './MiniComponents';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { appRoles } from '../authConfig';

import { useAppSelector, useAppDispatch } from "../hooks";
import { loadUserConfiguration, setAuthenticated, setExpiresAt, setToken, toggleDarkMode } from "../stateSlices/UserSlice";
import { useState } from 'react';
import RolesModal from './RolesModal';
import Preferences from './Preferences/PreferencesModal';
import { ReactNode } from 'react';
import { showSpinner } from '../stateSlices/MainLogoSpinnerSlice';
import { APIErrorToastCallback, authClient, errorToastCallback, handleError, handleResult } from '../APIClients';
import { APISuccessData } from '../types/Generics';

/**
 * Component for the main navigation bar
 * 
 * @returns Returns the main navigation bar container
 */
export default function MainNavbar() {
  const dispatch = useAppDispatch()

  const [showRoles, setShowRoles] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  function onAuth() {
    dispatch(showSpinner(true))
    window.location.href = '/auth/login?spa=1';
  }

  function onLogout() {
    authClient.get("/logout").then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)

    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)

    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(setToken(""))
      dispatch(setExpiresAt(0))
      dispatch(setAuthenticated(false))
    }
  }


  // const auth = useAuth();
  const authenticated = useAppSelector(state => state.user.authenticated)
  if (authenticated) {

    const roles = useAppSelector(state => state.user.roles)
    const name = useAppSelector(state => state.user.name)

    return <MainNavbarParent showRoles={showRoles} setShowRoles={setShowRoles} showPreferences={showPreferences} setShowPreferences={setShowPreferences}>
      <MainNavbarLeftParent>
        {roles.includes(appRoles.Requirements.Reader) ? <Nav.Link as={Link} to="/browse">Browse</Nav.Link> : null}
        {roles.includes(appRoles.Comments.Moderator) ? <Nav.Link as={Link} to="/Comments">Comments</Nav.Link> : null}
        {roles.includes(appRoles.Requirements.Writer) ?
          <NavDropdown title="Edit" id="navbarDropdownEdit">
            <NavDropdown.Item as={Link} to="/Edit/Tags">Tags</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Catalogues">Catalogues</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Topics">Topics</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Requirements">Requirements</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/ExtraTypes">ExtraTypes</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/ExtraEntries">ExtraEntries</NavDropdown.Item>
          </NavDropdown>
          : null}
        {roles.includes(appRoles.Requirements.Auditor) || roles.includes(appRoles.Comments.Auditor) ?
          <NavDropdown title="Audit" id="navbarDropdownAudit">
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
        {roles.includes(appRoles.Configuration.Writer) || roles.includes(appRoles.ServiceUser.Writer) ?
          <NavDropdown title="Administration" id="navbarDropdownAdministration">
            {roles.includes(appRoles.Configuration.Writer) ? <>
              <NavDropdown.Item as={Link} to="/Administration/System">System</NavDropdown.Item>
            </> : null}
            {roles.includes(appRoles.ServiceUser.Writer) ?
              <NavDropdown.Item as={Link} to="/Administration/ServiceUser">ServiceUser</NavDropdown.Item>
              : null}
          </NavDropdown>
          : null}
      </MainNavbarLeftParent>
      <MainNavbarRightParent>
        <NavDropdown title={name} id="accountDropdown" align="end">
          {authenticated ?
            <>
              <NavDropdown.Item onClick={() => { setShowRoles(true) }}>My Roles</NavDropdown.Item>
              <NavDropdown.Item onClick={() => { dispatch(loadUserConfiguration()); setShowPreferences(true) }}>Preferences</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/APIDoc">API Doc</NavDropdown.Item>
              <NavDropdown.Item onClick={onLogout}>Logout</NavDropdown.Item>
            </> :
            <NavDropdown.Item onClick={onAuth}>Login</NavDropdown.Item>
          }
        </NavDropdown>
      </MainNavbarRightParent>
    </MainNavbarParent>


  } else {
    return <MainNavbarParent showRoles={showRoles} setShowRoles={setShowRoles} showPreferences={showPreferences} setShowPreferences={setShowPreferences}>
      <MainNavbarLeftParent />
      <MainNavbarRightParent>
        <NavDropdown title={"Nobody"} id="accountDropdown" align="end">
          <NavDropdown.Item onClick={onAuth}>Login</NavDropdown.Item>
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
}

function MainNavbarParent({ children, showRoles, setShowRoles, showPreferences, setShowPreferences }: MainNavbarParentProps) {

  return <Navbar className="bg-body-tertiary">
    <Container fluid>
      <Navbar.Brand as={Link} to="/"><MainLogoSpinner></MainLogoSpinner>ReqDB</Navbar.Brand>
      <Navbar.Toggle aria-controls="mainNavbarCollapse" />
      {children}

    </Container>
    {showRoles ? <RolesModal show={showRoles} setShow={setShowRoles} /> : null}
    <Preferences show={showPreferences} setShow={setShowPreferences} />
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
    <Navbar.Text className="justify-content-end"><Button variant="outline-secondary" onClick={() => { dispatch(toggleDarkMode()) }}><FontAwesomeIcon icon={darkMode ? "sun" : "moon"} /></Button></Navbar.Text>
    <Navbar.Text className='navbar-signed-in-text'>Signed in as:</Navbar.Text>
    {children}
  </Navbar.Collapse>
}