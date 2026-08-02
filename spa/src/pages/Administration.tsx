import { Button, Col, Dropdown, Row, Stack } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";
import { appRoles } from "../authConfig";
import { Link } from "react-router";
import { Item } from "../types/API/ServiceUser";
import { Item as Configuration } from "../types/API/Configuration";
import { EditParent } from "../components/Edit/Parent";
import { useTranslation } from 'react-i18next';


/**
 * Container for administration area
 * 
 * @returns Container for the administration view
 */
export default function Administration() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: t('nav.administration'), active: true }]))
    dispatch(setPageTitle(t('nav.administration')))
  }, []);

  const roles = useAppSelector(state => state.user.roles)

  return <>
    <Row>
      <Col><h1>{t('nav.administration')}</h1></Col>
    </Row>
    <Row>
      <Col>
        <Stack gap={2} className="col-md-3 mx-auto">
          {roles.includes(appRoles.Configuration.Writer) || roles.includes(appRoles.ServiceUser.Writer) ?
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle as={Button} variant="outline-secondary" id="dropdown-edit" className="mx-auto w-100">
                {t('nav.administration')}
              </Dropdown.Toggle>
              <Dropdown.Menu className="mx-auto w-100">
                {roles.includes(appRoles.Configuration.Writer) ? <>
                  <Dropdown.Item as={Link} to="/Administration/System">{t('nav.system')}</Dropdown.Item>
                </> : null}
                {roles.includes(appRoles.ServiceUser.Writer) ?
                  <Dropdown.Item as={Link} to="/Administration/ServiceUser">{t('nav.serviceUser')}</Dropdown.Item>
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
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: t('nav.administration'), active: true }, { href: "", title: t('nav.system'), active: true }]))
    dispatch(setPageTitle(t('nav.system')))
  }, []);
  return <EditParent editPageName="system.configuration.name" humanKey="key"
    headers={[
      t('system.configuration.headers.category'),
      t('system.configuration.headers.key'),
      t('system.configuration.headers.value')
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
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: t('nav.administration'), active: true }, { href: "", title: t('nav.serviceUser'), active: true }]))
    dispatch(setPageTitle(t('nav.serviceUser')))
  }, []);

  return <EditParent editPageName="system.serviceUser.name" humanKey="id"
    headers={[
      "#",
      t('system.configuration.serviceUser.headers.email'),
      t('system.configuration.serviceUser.headers.created')
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
