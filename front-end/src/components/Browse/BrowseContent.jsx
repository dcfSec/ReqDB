import { Button, Col, Container, Dropdown, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../MiniComponents";
import { useEffect, useState } from "react";
import { ErrorMessage, buildRows } from '../MiniComponents'
import RequirementsTable from "../Browse/RequirementsTable";
import { CheckboxDropdown } from "../CheckboxDropdown";
import FilterTopicModal from "../Browse/FilterTopicsModal";
import { protectedResources } from "../../authConfig";
import useFetchWithMsal from "../../hooks/useFetchWithMsal";
import { ExportTable } from "../Export";
import Search from "./Search"

import { useSelector, useDispatch } from 'react-redux'
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { reset, setData, addRow, sortRows, setTagFilterItems, addTopicFilterItems, sortTopicFilterItems, addExtraHeader, setStatus, setTitle, trace } from '../../stateSlices/BrowseSlice';

import { Suspense, startTransition, useDeferredValue } from "react";
import BrowseRow from "./BrowseRow";

/**
 * View to browse a
 * 
 * @returns View to browse a catalogues
 */
export default function BrowseContent({ id }) {
  const dispatch = useDispatch()
  const rows = useSelector(state => state.browse.rows.items)
  const tagFilterItems = useSelector(state => state.browse.tags.filterItems)
  const topicFilterItems = useSelector(state => state.browse.topics.filterItems)
  const extraHeaders = useSelector(state => state.browse.extraHeaders)
  const APIData = useSelector(state => state.browse.data)
  const status = useSelector(state => state.browse.status)

  const deferredRows = useDeferredValue(rows);

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  const [APIError, setAPIError] = useState(null);

  useEffect(() => {
    dispatch(reset());
    dispatch(showSpinner(true))
    dispatch(setStatus("loading"));
    execute("GET", `catalogues/${id}?extended`).then((response) => {
      if (response && response.status === 200) {
        startTransition(() => {
        let tagFilterItemsTmp = []

        buildRows(extraHeaders, tagFilterItemsTmp, [], { children: response.data.topics })
        dispatch(setTagFilterItems(tagFilterItemsTmp))
        dispatch(sortRows())
        dispatch(sortTopicFilterItems())
        dispatch(setData(response.data))
        dispatch(setTitle(response.data.title))
        dispatch(showSpinner(false))
        dispatch(setStatus("ok"));
        });
      } else if (response && response.status !== 200) {
        setAPIError(response.message)
        dispatch(setFetched("error"));
      }
    });
  }, [execute])

  let errorMessage = ""

  if (error) {
    errorMessage = `Error loading catalogue data. Error: ${error.message}`
  } else if (APIError) {
    errorMessage = ErrorMessage(APIError)
  }

  const [showFilterModal, setShowFilterModal] = useState(false);

  if (status == "ok") {

    return (
      <>
        <Row>
          <Col><Search /></Col>
        </Row>
        <Suspense>
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
          </Row >
          <Row>
            <Col>
              <RequirementsTable>
                {deferredRows.map((row, index) => (<BrowseRow key={index} index={index} row={{...row}}></BrowseRow>))}
              </RequirementsTable>
            </Col>
          </Row>
          <FilterTopicModal show={showFilterModal} setShow={setShowFilterModal} />
        </Suspense>
      </>
    );
  } else if (APIError || error) {
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
            {errorMessage}
          </Col>
        </Row>
      </Container>
    )
  } else {
    return null
  }
}
