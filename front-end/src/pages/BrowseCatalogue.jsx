import { Alert, Button, Col, Container, Dropdown, ProgressBar, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import { useEffect, useState } from "react";
import { ErrorMessage } from '../components/MiniComponents'
import RequirementsTable from "../components/Browse/RequirementsTable";
import Search from "../components/Browse/Search";
import { CheckboxDropdown } from "../components/CheckboxDropdown";
import { useParams } from "react-router-dom";
import FilterTopicModal from "../components/Browse/FilterTopicsModal";
import { protectedResources } from "../authConfig";
import useFetchWithMsal from "../hooks/useFetchWithMsal";
import { ExportTable } from "../components/Export";

import { useSelector, useDispatch } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setData, addRow, sortRows, setTagFilterItems, addTopicFilterItems, sortTopicFilterItems, addExtraHeader } from '../stateSlices/BrowseSlice';

/**
 * View to browse a
 * 
 * @returns View to browse a catalogues
 */
export default function BrowseCatalogue() {
  const dispatch = useDispatch()
  const rows = useSelector(state => state.browse.rows.items)
  const tagFilterItems = useSelector(state => state.browse.tags.filterItems)
  const topicFilterItems = useSelector(state => state.browse.topics.filterItems)
  const extraHeaders = useSelector(state => state.browse.extraHeaders)
  const APIData = useSelector(state => state.browse.data)

  const title = "Browse"
  const breadcrumbs = [
    { href: "/Browse", title: title, active: false }
  ]

  document.title = `${title} | ReqDB - Requirement Database`;

  const params = useParams();
  const id = params.catalogueId

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
    execute("GET", `catalogues/${id}?extended`).then((response) => {
      if (response && response.status === 200) {
        let tagFilterItemsTmp = []

        buildRows(extraHeaders, tagFilterItemsTmp, [], { children: response.data.topics })
        dispatch(setTagFilterItems(tagFilterItemsTmp))
        dispatch(sortRows())
        dispatch(sortTopicFilterItems())
        dispatch(setData(response.data))

        setFetched(true);
      } else if (response && response.status !== 200) {
        setAPIError(response.message)
        setFetched(true);
      }
    });
  }, [execute])

  let init = false
  let errorMessage = ""

  if (fetched && !APIError && !init) {
    init = true
  }

  if (error) {
    errorMessage = `Error loading catalogue data. Error: ${error.message}`
  } else if (APIError) {
    errorMessage = ErrorMessage(APIError)
  }

  const [showFilterModal, setShowFilterModal] = useState(false);

  if (init) {

    document.title = `${APIData.title} | ReqDB - Requirement Database`;
    breadcrumbs.push({ href: "", title: APIData.title, active: true })

    return (
      <Container fluid className="bg-body">
        <Row>
          <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
        </Row>
        <Row>
          <Col><h2>Browse <code>{APIData.title}</code></h2></Col>
        </Row>
        <Row>
          <Col><Search /></Col>
        </Row>
        <Row>
          <Col>
            <Dropdown className="d-inline">
              <Dropdown.Toggle id="tag-dropdown">Filter Tags</Dropdown.Toggle>
              <Dropdown.Menu as={CheckboxDropdown}>
                {[...tagFilterItems].sort().map((tag, index) => (<Dropdown.Item key={index} eventKey={tag}>{tag}</Dropdown.Item>))}
              </Dropdown.Menu>
            </Dropdown>
            <Button className="mx-1" onClick={() => { setShowFilterModal(true) }}>Filter topic</Button>
          </Col>
          <Col md={2}>
            <Stack direction="horizontal" gap={3}>
              <div className="p-2 ms-auto"><ExportTable /></div>
            </Stack></Col>
        </Row>
        <Row>
          <Col>
            <RequirementsTable rows={rows}></RequirementsTable>
          </Col>
        </Row>
        <FilterTopicModal show={showFilterModal} setShow={setShowFilterModal} />
      </Container>
    );
  } else {
    return (
      <Container fluid className="bg-body">
        <Row>
          <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
        </Row>
        <Row>
          <Col><h2>Browse</h2></Col>
        </Row>
        <Row>
          <Col>
            {APIError || error ? <Alert variant="danger">{errorMessage}</Alert> : <ProgressBar animated now={100} />}
          </Col>
        </Row>
      </Container>
    )
  }

  function buildRows(extraHeaders, tagFilterItems, topics, item) {

    if ('requirements' in item) {
      item.requirements.forEach(requirement => {
        const tags = []
        if (requirement.visible === true) {
          if (requirement.tags.length == 0 && !tagFilterItems.includes("No Tags")) {
            tagFilterItems.push("No Tags")
          }
          requirement.tags.forEach(tag => {
            tags.push(tag.name)
            if (!tagFilterItems.includes(tag.name)) {
              tagFilterItems.push(tag.name)
            }
          });
          const base = {
            id: requirement.id,
            Tags: tags,
            Topics: [...topics],
            Key: requirement.key,
            Title: requirement.title,
            Description: requirement.description,
            Comments: requirement.comments,
          }
          const extraColumns = {}
          requirement.extras.forEach(extra => {
            extraColumns[extra.extraType.title] = extra.content
            if (!Object.keys(extraHeaders).includes(extra.extraType.title)) {
              const header = {}
              header[extra.extraType.title] = extra.extraType.extraType
              dispatch(addExtraHeader(header))
            }
          });
          dispatch(addRow({ ...base, ...extraColumns }))
        }
      });
    }
    if ('children' in item) {
      item.children.forEach(topic => {
        if (!topicFilterItems.includes(`${topic.key} ${topic.title}`)) {
          dispatch(addTopicFilterItems(`${topic.key} ${topic.title}`))
        }
        buildRows(extraHeaders, tagFilterItems, [...topics, topic], topic)
      });
    }
  }

}
