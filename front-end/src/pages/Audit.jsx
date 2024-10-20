import { useState, useEffect } from 'react';
import { Button, Col, Dropdown, Row } from "react-bootstrap";
import DataLayout from '../components/DataLayout';
import DataTable from '../components/DataTable';

import { CheckboxDropdown } from "../components/CheckboxDropdown";
import { Alert } from 'react-bootstrap';
import { ErrorMessage } from '../components/MiniComponents'
import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { protectedResources } from '../authConfig';

import { useSelector, useDispatch } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../stateSlices/NotificationToastSlice";
import { setItems } from "../stateSlices/EditSlice";
import LoadingBar from '../components/LoadingBar';
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import AuditRow from '../components/Audit/AuditRow';

import { toggleActionFilterSelected, toggleActionFilterSelectedAll } from '../stateSlices/AuditSlice';

/**
 * Component for the parent view of the editor pages
 * 
 * @param {object} props Props for the component: auditPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters
 * @returns Parent component for all editor views
 */
function AuditParent({ auditPageName, headers, searchFields, endpoint }) {
  const dispatch = useDispatch()
  const items = useSelector(state => state.edit.items)

  useEffect(() => {
    dispatch(setPageTitle(auditPageName))
    dispatch(setBreadcrumbs([{ href: "", title: "Audit", active: true }, { href: "", title: auditPageName, active: true }]))
  }, []);

  const [search, setSearch] = useState("");

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    execute("GET", `audit/${endpoint}`).then((response) => {
      if (response && response.status === 200) {
        dispatch(setItems(response.data))
        setFetched(true);
      } else if (response && response.status !== 200) {
        dispatch(toast({ header: response.error, body: response.message }));
        setAPIError(response.message);
        setFetched(true);
      }
    });
  }, [execute])

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    body = <>
      <Row>
        <Col>
          <Dropdown className="d-inline">
            <Dropdown.Toggle id="tag-dropdown">Filter Actions</Dropdown.Toggle>
            <Dropdown.Menu as={CheckboxDropdown} target="action" toggleChangeAll={toggleActionFilterSelectedAll} toggleChange={toggleActionFilterSelected}>
              {["INSERT", "UPDATE", "DELETE"].map((verb, index) => (<Dropdown.Item key={index} eventKey={verb}>{verb}</Dropdown.Item>))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row >
      <Row><Col><DataTable headers={["Timestamp", "User", "Action", ...headers, "Parent"]}>
        {items.map((item, index) => (
          renderItem(item, index)
        ))}
      </DataTable></Col></Row>
    </>
  }
  function onSearch(s) {
    setSearch(s)
  }

  function renderItem(item, index) {
    if (item) {
      return <AuditRow
        key={item.transaction_id}
        index={index}
        item={item}
        search={search}
        searchFields={searchFields}
        auditPageName={auditPageName}
      ></AuditRow>
    } else {
      return null
    }
  }

  return (<>
    <DataLayout title={auditPageName} search={search} onSearch={onSearch}>
      {body}
    </DataLayout>
  </>
  );

}

/**
 * View for editing Tags
 * 
 * @returns Tags view for editing
 */
export function AuditTags() {
  return <AuditParent auditPageName="Tags" humanKey="name"
    headers={[
      "Tag ID",
      "Name",
    ]}
    searchFields={[
      "verb",
      "name",
      "transaction.user_id"
    ]}
    endpoint="tags"
  />
}

/**
 * View for editing Catalogues
 * 
 * @returns Catalogues view for editing
 */
export function AuditCatalogues() {
  return <AuditParent auditPageName="Catalogues" humanKey="title"
    headers={[
      "Catalogue ID",
      "Title",
      "Description",
    ]}
    searchFields={[
      "verb",
      "title",
      "description",
      "transaction.user_id"
    ]}
    endpoint="catalogues"
    parameters={["nested"]}
  />
}

/**
 * View for editing Topics
 * 
 * @returns Topics view for editing
 */
export function AuditTopics() {
  return <AuditParent auditPageName="Topics" humanKey="key"
    headers={[
      "Topic ID",
      "Key",
      "Title",
      "Description",
    ]}

    searchFields={[
      "verb", "key", "title", "description"
    ]}
    endpoint="topics"
  />
}

/**
 * View for editing Requirements
 * 
 * @returns Requirements view for editing
 */
export function AuditRequirements() {
  return <AuditParent auditPageName="Requirements" humanKey="key"
    headers={[
      "Requirement ID",
      "Key",
      "Title",
      "Description",
      "Parent",
      "Visible"
    ]}
    searchFields={[
      "verb", "key", "title", "description"
    ]}
    endpoint="requirements"
  />
}

/**
 * View for editing ExtraTypes
 * 
 * @returns ExtraTypes view for editing
 */
export function AuditExtraTypes() {
  return <AuditParent auditPageName="ExtraTypes" humanKey="title"
    headers={[
      "ExtraType ID",
      "Title",
      "Description",
      "Type",
    ]}

    searchFields={[
      "verb", "title", "description"
    ]}
    endpoint="extraTypes"
  />
}

/**
 * View for editing ExtraEntries
 * 
 * @returns ExtraEntries view for editing
 */
export function AuditExtraEntries() {
  return <AuditParent auditPageName="ExtraEntries" humanKey="id"
    headers={[
      "ExtraEntry ID",
      "Content",
      "ExtraType ID",
      "Requirement ID",
    ]}

    searchFields={[
      "content",
      "extraType.title",
      "requirement.key"
    ]}
    endpoint="extraEntries"
  />
}

/**
 * View for editing ExtraEntries
 * 
 * @returns ExtraEntries view for editing
 */
export function AuditComments() {
  return <AuditParent auditPageName="Comments" humanKey="id"
    headers={[
      "Comment ID",
      "Comment",
      "Author",
      "Completed",
      "Requirement ID",
    ]}

    searchFields={[
      "comment",
      "author",
      "requirement.key"
    ]}
    endpoint="comments"
  />
}
