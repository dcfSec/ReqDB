import { Alert, Col, Row } from "react-bootstrap";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { useTranslation } from "react-i18next";

/**
 * View for a 404 page
 * 
 * @returns Returns a 404 page
 */
export default function NoPage() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: t('404.title'), active: true }]))
    dispatch(setPageTitle(t('404.title')))
  }, []);

  return <>
    <Row>
      <Col><h2>{t('404.title')}</h2></Col>
    </Row>
    <Row>
      <Col><Alert variant="danger">{t('404.error')}</Alert>
      </Col>
    </Row>
  </>;
}
