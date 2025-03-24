import { Badge, Button, Col, OverlayTrigger, Row, Stack, Tooltip } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import LoadingBar from "../components/LoadingBar";
import BrowseContent from "../components/Browse/BrowseContent";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * View to browse a
 * 
 * @returns View to browse a catalogues
 */
export default function BrowseCatalogue() {

  const title = useAppSelector(state => state.layout.pageTitle)
  const description = useAppSelector(state => state.browse.description)
  const status = useAppSelector(state => state.browse.status)
  const data = useAppSelector(state => state.browse.data) 

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Loading..."))
    dispatch(setBreadcrumbs([{ href: "/Browse", title: "Browse", active: false }, { href: "", title: title, active: true }]))
  }, []);

  const params = useParams();
  const id = params.catalogueId

  const overlay = <OverlayTrigger placement="right" delay={{ show: 50, hide: 200 }} overlay={<Tooltip id="button-tooltip">{description}</Tooltip>}>
    <Button variant="link" style={{ height: '1.5rem', width: '1.5rem', padding: '0em' }} size='sm' ><FontAwesomeIcon icon={["far", "circle-question"]} /></Button></OverlayTrigger>

  return (
    <>
      <Row>
        <Col>
          <Stack direction="horizontal" gap={1}>
            <h2>Browse <code>{title}</code></h2>
            {status == "ok" ? overlay : null}
            {data?.tags.map((item) => (
              <Badge key={`tag-${item.id}`} bg="secondary" className="lowerHeaderButton">{item.name}</Badge>
            ))}
          </Stack>
        </Col>
      </Row>
      <BrowseContent id={id} />
      <LoadingBar />
    </>
  );
}

