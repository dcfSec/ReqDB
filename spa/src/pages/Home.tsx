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
import { useTranslation } from 'react-i18next';


/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function Home() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: t('nav.home'), active: true }]))
    dispatch(setPageTitle(t('nav.home')))
    dispatch(showSpinner(true))
    dispatch(loadConfiguration())
  }, []);

  const roles = useAppSelector(state => state.user.roles)

  return <>
    <Row>
      <Col><h1>{t('app.name')}</h1></Col>
    </Row>
    <Row>
      <Col>
        <Stack gap={2} className="col-md-3 mx-auto">
          <h2>{staticConfig.home.title}</h2>
          <Markdown>{staticConfig.home.MOTD.pre}</Markdown>
          <LinkContainer to="Browse"><Button variant="outline-secondary">{t('nav.browse')}</Button></LinkContainer>
          {roles.includes(appRoles.Comments.Moderator) ?
            <LinkContainer to="Comments"><Button variant="outline-secondary">{t('nav.comments')}</Button></LinkContainer>
            : null}
          {roles.includes(appRoles.Requirements.Writer) ?
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle as={Button} variant="outline-secondary" id="dropdown-edit" className="mx-auto w-100">
                {t('nav.edit')}
              </Dropdown.Toggle>
              <Dropdown.Menu className="mx-auto w-100">
                <Dropdown.Item as={Link} to="/Edit/Tags">{t('nav.tags')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/Catalogues">{t('nav.catalogues')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/Topics">{t('nav.topics')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/Requirements">{t('nav.requirements')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/ExtraTypes">{t('nav.extraTypes')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Edit/ExtraEntries">{t('nav.extraEntries')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown> : null}
          {roles.includes(appRoles.Requirements.Auditor) || roles.includes(appRoles.Comments.Auditor) ?
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle as={Button} variant="outline-secondary" id="dropdown-edit" className="mx-auto w-100">
                {t('nav.audit')}
              </Dropdown.Toggle>
              <Dropdown.Menu className="mx-auto w-100">
                {roles.includes(appRoles.Requirements.Auditor) ? <>
                  <Dropdown.Item as={Link} to="/Audit/Tags">{t('nav.tags')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/Catalogues">{t('nav.catalogues')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/Topics">{t('nav.topics')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/Requirements">{t('nav.requirements')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/ExtraTypes">{t('nav.extraTypes')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Audit/ExtraEntries">{t('nav.extraEntries')}</Dropdown.Item>
                </> : null}
                {roles.includes(appRoles.Comments.Auditor) ?
                  <Dropdown.Item as={Link} to="/Audit/Comments">{t('nav.comments')}</Dropdown.Item>
                  : null}
              </Dropdown.Menu>
            </Dropdown> : null}
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
          <Markdown>{staticConfig.home.MOTD.post}</Markdown>
        </Stack>
      </Col>
    </Row>
  </>;
};
