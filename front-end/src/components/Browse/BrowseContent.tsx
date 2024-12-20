import { Button, Col, Container, Dropdown, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../MiniComponents";
import { useEffect, useState } from "react";
import { ErrorMessage, buildRows } from '../MiniComponents'
import RequirementsTable from "./RequirementsTable";
import CheckboxDropdown from "../CheckboxDropdown";
import FilterTopicModal from "./FilterTopicsModal";
import { protectedResources } from "../../authConfig";
import useFetchWithMsal from "../../hooks/useFetchWithMsal";
import { ExportTable } from "../Export";
import Search from "./Search"
import { toggleTagFilterSelected, toggleTagFilterSelectedAll } from '../../stateSlices/BrowseSlice';

import { useAppDispatch, useAppSelector } from "../../hooks";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { reset, setData, sortRows, setTagFilterItems, sortTopicFilterItems, setStatus } from '../../stateSlices/BrowseSlice';
import { setPageTitle } from "../../stateSlices/LayoutSlice";

import { Suspense, startTransition, useDeferredValue } from "react";
import BrowseRow from "./BrowseRow";
import { Item as Topic } from "../../types/API/Topics";


type Props = {
  id: string | undefined
}

/**
 * View to browse a
 * 
 * @returns View to browse a catalogues
 */
export default function BrowseContent({ id }: Props) {
  const dispatch = useAppDispatch()
  const rows = useAppSelector(state => state.browse.rows.items)
  const tagFilterItems = useAppSelector(state => state.browse.tags.filterItems)
  // const topicFilterItems = useAppSelector(state => state.browse.topics.filterItems)
  const extraHeaders = useAppSelector(state => state.browse.extraHeaders)
  // const APIData = useAppSelector(state => state.browse.data)
  const status = useAppSelector(state => state.browse.status)

  // const selected = useAppSelector(state => state.browse.tags.filterSelected)
  // const allSelected = useAppSelector(state => state.browse.tags.allSelected)

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
        const tagFilterItemsTmp: Array<string> = []

        buildRows(extraHeaders, tagFilterItemsTmp, [], { id:0, key: "", title: "", children: response.data.topics } as Topic)
        dispatch(setTagFilterItems(tagFilterItemsTmp))
        dispatch(sortRows())
        dispatch(sortTopicFilterItems())
        dispatch(setData(response.data))
        dispatch(setPageTitle(response.data.title))
        dispatch(showSpinner(false))
        dispatch(setStatus("ok"));
        });
      } else if (response && response.status !== 200) {
        setAPIError(response.message)
        // dispatch(setFetched("error"));
      }
    });
  }, [execute])

  let errorMessage = <></>

  if (error) {
    errorMessage = <>Error loading catalogue data. Error: ${error.message}</>
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
                <Dropdown.Menu as={CheckboxDropdown} target="tag" toggleChangeAll={toggleTagFilterSelectedAll} toggleChange={toggleTagFilterSelected}>
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
          <Col><MainBreadcrumb/></Col>
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
