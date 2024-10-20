import { Button, Col, Dropdown, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { appRoles } from "../authConfig";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { homeTitle, preMOTD, postMOTD } from "../static";
import { useSelector, useDispatch } from 'react-redux'
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";

/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function Home() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Home", active: true }]))
    dispatch(setPageTitle("Home"))
  }, []);

  const roles = useSelector(state => state.user.roles)

  return <>
    <Row>
      <Col><h1>ReqDB</h1></Col>
    </Row>
    <Row>
      <Col>
        <Stack gap={2} className="col-md-3 mx-auto">
          <h2>{homeTitle}</h2>
          <ReactMarkdown>{preMOTD}</ReactMarkdown>
          <Button as={Link} to="Browse" variant="outline-secondary">Browse Catalogues</Button>
          {roles.includes(appRoles.Comments.Moderator) ?
            <Button as={Link} to="Comments" variant="outline-secondary">Comments</Button>
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
          {roles.includes(appRoles.Requirements.Auditor) ||  roles.includes(appRoles.Comments.Auditor) ?
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
          <ReactMarkdown>{postMOTD}</ReactMarkdown>
        </Stack>
      </Col>
    </Row>
  </>;
};
