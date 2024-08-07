import { Button, Col, Container, Dropdown, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import { Link } from "react-router-dom";
import { appRoles } from "../authConfig";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { homeTitle, preMOTD, postMOTD } from "../static";
import { useSelector } from 'react-redux'

/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function Home() {
  const title = "Home"
  const breadcrumbs = [
    { href: "", title: title, active: true }
  ]
  document.title = `${title} | ReqDB - Requirement Database`;

  const roles = useSelector(state => state.user.roles)

  return <Container fluid className="bg-body">
    <Row>
      <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
    </Row>
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
          <ReactMarkdown>{postMOTD}</ReactMarkdown>
        </Stack>
      </Col>
    </Row>
  </Container>;
};
