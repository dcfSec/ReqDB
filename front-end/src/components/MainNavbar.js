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
import { useEffect, useState } from 'react';
import { appRoles } from '../authConfig';

export default function MainNavbar({ showSpinner, darkMode, setDarkMode }) {

  function setDarkModeSwitch() {
    document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", !darkMode ? "dark" : "light");
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  }

  const { instance } = useMsal();
  const account = instance.getActiveAccount();
  const [roles, setRoles] = useState([]);

  const onLoad = async () => {
    const currentAccount = instance.getActiveAccount();

    if (currentAccount && currentAccount.idTokenClaims['roles']) {
      setRoles(currentAccount.idTokenClaims['roles']);
    }
  };

  useEffect(() => {
    onLoad();
  }, [instance]);

  return (
    <Navbar className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} to="/"><MainLogoSpinner show={showSpinner} ></MainLogoSpinner>ReqDB</Navbar.Brand>
        <Navbar.Toggle aria-controls="mainNavbarCollapse" />
        <Navbar.Collapse id="mainNavbarCollapse">
        <Nav
          className="me-auto my-2 my-lg-0"
          navbarScroll
        >
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          { roles.includes(appRoles.Reader) || roles.includes(appRoles.Writer) ? <Nav.Link as={Link} to="/browse">Browse</Nav.Link> : null }
          { roles.includes(appRoles.Writer) ? 
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
      <Navbar.Text className="justify-content-end"><Button variant="outline-secondary" onClick={setDarkModeSwitch}><FontAwesomeIcon icon={darkMode ? solid("sun") : solid("moon")} /></Button></Navbar.Text>
        <Navbar.Text className='navbar-signed-in-text'>Signed in as:</Navbar.Text>
          <NavDropdown title={ account ? account.username : "Nobody"} id="accountDropdown">
          { account ? <NavDropdown.Item onClick={() => {instance.logoutRedirect()}}>Logout</NavDropdown.Item> : <NavDropdown.Item onClick={() => {instance.loginRedirect()}}>Login</NavDropdown.Item> }
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
