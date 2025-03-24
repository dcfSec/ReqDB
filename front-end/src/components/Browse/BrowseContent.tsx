import { Alert, Button, Col, Dropdown, Row, Stack } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ErrorMessage, buildRows } from '../MiniComponents'
import RequirementsTable from "./RequirementsTable";
import CheckboxDropdown from "../CheckboxDropdown";
import FilterTopicModal from "./FilterTopicsModal";
import { ExportTable } from "../Export";
import Search from "./Search"
import { setDescription, toggleTagFilterSelected, toggleTagFilterSelectedAll } from '../../stateSlices/BrowseSlice';

import { useAppDispatch, useAppSelector } from "../../hooks";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { reset, setData, sortRows, setTagFilterItems, sortTopicFilterItems, setStatus } from '../../stateSlices/BrowseSlice';
import { setPageTitle } from "../../stateSlices/LayoutSlice";

import { Suspense, startTransition, useDeferredValue } from "react";
import BrowseRow from "./BrowseRow";
import { Item as Topic } from "../../types/API/Topics";
import APIClient, { handleError, handleResult } from "../../APIClient";
import { APIErrorData, APISuccessData } from "../../types/Generics";

import { Item as Catalogue } from "../../types/API/Catalogues";

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

  const [APIError, setAPIError] = useState<string | Array<string> | Record<string, Array<string>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  let init = false

  useEffect(() => {
    if (init === false) {
      init = true
      dispatch(reset());
      dispatch(showSpinner(true))
      dispatch(setStatus("loading"));
  
      APIClient.get(`catalogues/${id}?expandTopics=true`).then((response) => {
        handleResult(response, okCallback, APIErrorCallback)
      }).catch((error) => {
        handleError(error, APIErrorCallback, errorCallback)
      });
    }
  }, [])

  function okCallback(response: APISuccessData) {
    startTransition(() => {
      dispatch(setData(response.data))
      dispatch(setDescription((response.data as Catalogue).description))
      dispatch(setPageTitle((response.data as Catalogue).title))
      const tagFilterItemsTmp: Array<string> = []
      buildRows(extraHeaders, tagFilterItemsTmp, [], { id: 0, key: "", title: "", children: (response.data as Catalogue).topics } as Topic).then(() => {
        dispatch(setTagFilterItems(tagFilterItemsTmp))
        dispatch(sortRows())
        dispatch(sortTopicFilterItems())
        dispatch(showSpinner(false))
        dispatch(setStatus("ok"));
      })

    });
  }

  function APIErrorCallback(response: APIErrorData) {
    setAPIError(response.message)
  }

  function errorCallback(error: string) {
    setError(error)
  }

  let errorMessage = <></>

  if (error) {
    errorMessage = ErrorMessage(error)
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
                {deferredRows.map((row, index) => (<BrowseRow key={index} index={index} row={{ ...row }}></BrowseRow>))}
              </RequirementsTable>
            </Col>
          </Row>
          <FilterTopicModal show={showFilterModal} setShow={setShowFilterModal} />
        </Suspense>
      </>
    );
  } else if (APIError || error) {
    return (
        <Row>
          <Col>
          <Alert variant="danger">{errorMessage}</Alert>
          </Col>
        </Row>
    )
  } else {
    return null
  }
}
