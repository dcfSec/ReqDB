import { Button, Col, Dropdown, Row, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { appRoles } from "../authConfig";
import Markdown from 'react-markdown'
import { staticConfig } from "../static";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { useEffect } from "react";
import { loadConfiguration } from "../stateSlices/ConfigurationSlice";
import LinkContainer from "../components/LinkContainer";


/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function Home() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Home", active: true }]))
    dispatch(setPageTitle("Home"))
    dispatch(showSpinner(true))
    dispatch(loadConfiguration())
  }, []);

  const roles = useAppSelector(state => state.user.roles)

  return <>
    <Row>
      <Col><h1>ReqDB</h1></Col>
    </Row>
    <Row>
      <Col>
        <Stack gap={2} className="col-md-3 mx-auto">
          <h2>{staticConfig.home.title}</h2>
          <Markdown>{staticConfig.home.MOTD.pre}</Markdown>
          <LinkContainer to="Browse"><Button variant="outline-secondary">Browse Catalogues</Button></LinkContainer>
          {roles.includes(appRoles.Comments.Moderator) ?
            <LinkContainer to="Comments"><Button variant="outline-secondary">Comments</Button></LinkContainer>
            : null}
          {roles.includes(appRoles.Requirements.Writer) ?
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle as={Button} variant="outline-secondary" id="dropdown-edit" className="mx-auto w-100">
                Edit
              </Dropdown.Toggle>
              <Dropdown.Menu className="mx-auto w-100">
                <Dropdown.Item as={Link} to="/Edit/Tags">Tags</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/Catalogues">Catalogues</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/Topics">Topics</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/Requirements">Requirements</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/ExtraTypes">ExtraTypes</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/ExtraEntries">ExtraEntries</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown> : null}
          {roles.includes(appRoles.Requirements.Auditor) || roles.includes(appRoles.Comments.Auditor) ?
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle as={Button} variant="outline-secondary" id="dropdown-edit" className="mx-auto w-100">
                Audit
              </Dropdown.Toggle>
              <Dropdown.Menu className="mx-auto w-100">
                {roles.includes(appRoles.Requirements.Auditor) ? <>
                  <Dropdown.Item as={Link} to="/Audit/Tags">Tags</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/Catalogues">Catalogues</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/Topics">Topics</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/Requirements">Requirements</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/ExtraTypes">ExtraTypes</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/ExtraEntries">ExtraEntries</Dropdown.Item>
                </> : null}
                {roles.includes(appRoles.Comments.Auditor) ?
                  <Dropdown.Item as={Link} to="/Audit/Comments">Comments</Dropdown.Item>
                  : null}
              </Dropdown.Menu>
            </Dropdown> : null}
          <Markdown>{staticConfig.home.MOTD.post}</Markdown>
        </Stack>
      </Col>
    </Row>
  </>;
};
