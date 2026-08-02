import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();


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
        {roles.includes(appRoles.Requirements.Reader) ? <Nav.Link as={Link} to="/browse">{t('nav.browse')}</Nav.Link> : null}
        {roles.includes(appRoles.Comments.Moderator) ? <Nav.Link as={Link} to="/Comments">{t('nav.comments')}</Nav.Link> : null}
        {roles.includes(appRoles.Requirements.Writer) ?
          <NavDropdown title={t('nav.edit')} id="navbarDropdownEdit">
            <NavDropdown.Item as={Link} to="/Edit/Tags">{t('nav.tags')}</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Catalogues">{t('nav.catalogues')}</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Topics">{t('nav.topics')}</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/Requirements">{t('nav.requirements')}</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/ExtraTypes">{t('nav.extraTypes')}</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/Edit/ExtraEntries">{t('nav.extraEntries')}</NavDropdown.Item>
          </NavDropdown>
          : null}
        {roles.includes(appRoles.Requirements.Auditor) || roles.includes(appRoles.Comments.Auditor) ?
          <NavDropdown title={t('nav.audit')} id="navbarDropdownAudit">
            {roles.includes(appRoles.Requirements.Auditor) ? <>
              <NavDropdown.Item as={Link} to="/Audit/Tags">{t('nav.tags')}</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/Audit/Catalogues">{t('nav.catalogues')}</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/Audit/Topics">{t('nav.topics')}</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/Audit/Requirements">{t('nav.requirements')}</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/Audit/ExtraTypes">{t('nav.extraTypes')}</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/Audit/ExtraEntries">{t('nav.extraEntries')}</NavDropdown.Item>
            </> : null}
            {roles.includes(appRoles.Comments.Auditor) ?
              <NavDropdown.Item as={Link} to="/Audit/Comments">{t('nav.comments')}</NavDropdown.Item>
              : null}
          </NavDropdown>
          : null}
        {roles.includes(appRoles.Configuration.Writer) || roles.includes(appRoles.ServiceUser.Writer) ?
          <NavDropdown title={t('nav.administration')} id="navbarDropdownAdministration">
            {roles.includes(appRoles.Configuration.Writer) ? <>
              <NavDropdown.Item as={Link} to="/Administration/System">{t('nav.system')}</NavDropdown.Item>
            </> : null}
            {roles.includes(appRoles.ServiceUser.Writer) ?
              <NavDropdown.Item as={Link} to="/Administration/ServiceUser">{t('nav.serviceUser')}</NavDropdown.Item>
              : null}
          </NavDropdown>
          : null}
      </MainNavbarLeftParent>
      <MainNavbarRightParent>
        <NavDropdown title={name} id="accountDropdown" align="end">
          {authenticated ?
            <>
              <NavDropdown.Item onClick={() => { setShowRoles(true) }}>{t('nav.roles')}</NavDropdown.Item>
              <NavDropdown.Item onClick={() => { dispatch(loadUserConfiguration()); setShowPreferences(true) }}>{t('nav.preferences')}</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/APIDoc">{t('nav.apiDoc')}</NavDropdown.Item>
              <NavDropdown.Item onClick={onLogout}>{t('nav.logout')}</NavDropdown.Item>
            </> :
            <NavDropdown.Item onClick={onAuth}>{t('nav.login')}</NavDropdown.Item>
          }
        </NavDropdown>
      </MainNavbarRightParent>
    </MainNavbarParent>


  } else {
    return <MainNavbarParent showRoles={showRoles} setShowRoles={setShowRoles} showPreferences={showPreferences} setShowPreferences={setShowPreferences}>
      <MainNavbarLeftParent />
      <MainNavbarRightParent>
        <NavDropdown title={t('nav.nobody')} id="accountDropdown" align="end">
          <NavDropdown.Item onClick={onAuth}>{t('nav.login')}</NavDropdown.Item>
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
  const { t } = useTranslation();
  return <Navbar.Collapse id="mainNavbarCollapse">
    <Nav
      className="me-auto my-2 my-lg-0"
      navbarScroll
    >
      <Nav.Link as={Link} to="/">{t('nav.home')}</Nav.Link>
      {children}
    </Nav>
  </Navbar.Collapse>
}

function MainNavbarRightParent({ children }: { children?: ReactNode; }) {
  const dispatch = useAppDispatch()
  const { t } = useTranslation();
  const darkMode = useAppSelector(state => state.user.preferences.darkMode)
  return <Navbar.Collapse className="justify-content-end">
    <Navbar.Text className="justify-content-end"><Button variant="outline-secondary" onClick={() => { dispatch(toggleDarkMode()) }}><FontAwesomeIcon icon={darkMode ? "sun" : "moon"} /></Button></Navbar.Text>
    <Navbar.Text className='navbar-signed-in-text'>{t('nav.user')}</Navbar.Text>
    {children}
  </Navbar.Collapse>
}
