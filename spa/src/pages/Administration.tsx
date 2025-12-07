import { Button, Col, Dropdown, Row, Stack } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";
import { appRoles } from "../authConfig";
import { Link } from "react-router";
import { Item } from "../types/API/ServiceUser";
import { Item as Configuration } from "../types/API/Configuration";
import { EditParent } from "../components/Edit/Parent";


/**
 * Container for administration area
 * 
 * @returns Container for the administration view
 */
export default function Administration() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Administration", active: true }]))
    dispatch(setPageTitle("Administration"))
  }, []);

  const roles = useAppSelector(state => state.user.roles)

  return <>
    <Row>
      <Col><h1>Administration</h1></Col>
    </Row>
    <Row>
      <Col>
        <Stack gap={2} className="col-md-3 mx-auto">
          {roles.includes(appRoles.Configuration.Writer) || roles.includes(appRoles.ServiceUser.Writer) ?
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle as={Button} variant="outline-secondary" id="dropdown-edit" className="mx-auto w-100">
                Administration
              </Dropdown.Toggle>
              <Dropdown.Menu className="mx-auto w-100">
                {roles.includes(appRoles.Configuration.Writer) ? <>
                  <Dropdown.Item as={Link} to="/Administration/System">System</Dropdown.Item>
                </> : null}
                {roles.includes(appRoles.ServiceUser.Writer) ?
                  <Dropdown.Item as={Link} to="/Administration/ServiceUser">ServiceUser</Dropdown.Item>
                  : null}
              </Dropdown.Menu>
            </Dropdown> : null}
        </Stack>
      </Col>
    </Row>
  </>;
};

/**
 * Container for administration area
 * 
 * @returns Container for the administration view
 */
export function System() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Administration", active: true }, { href: "", title: "System Configuration", active: true }]))
    dispatch(setPageTitle("System Configuration"))
  }, []);
  return <EditParent editPageName="System Configuration" humanKey="key"
    headers={[
      "Category",
      "Key",
      "Value"
    ]}
    blankItem={{
      key: "",
      value: "",
    } as Configuration}
    searchFields={[
      "key",
    ]}
    endpoint="config/system"
    needCascade={false}
    parameters={[]}
    deletable={false}
    selectable={false}
  />
  // return <>
  //   <Row>
  //     <Col><h1>System Configuration</h1></Col>
  //   </Row>
  //   <SystemConfiguration />
  // </>;
};

/**
 * Container for administration area
 * 
 * @returns Container for the administration view
 */
export function ServiceUser() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Administration", active: true }, { href: "", title: "ServiceUser", active: true }]))
    dispatch(setPageTitle("Administration"))
  }, []);

  return <EditParent editPageName="ServiceUser" humanKey="id"
    headers={[
      "#",
      "E-Mail (Display name)",
      "Created"
    ]}
    blankItem={{
      id: "",
      email: "",
    } as Item}
    searchFields={[
      "id",
      "email"
    ]}
    endpoint="config/service/users"
    needCascade={false}
    parameters={[]}
  />
};
