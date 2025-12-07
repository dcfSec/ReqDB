import { useState, useEffect } from 'react';
import { Col, Dropdown, Form, Row } from "react-bootstrap";
import DataLayout from '../components/DataLayout';
import DataTable from '../components/DataTable';

import CheckboxDropdown from "../components/CheckboxDropdown";
import { Alert } from 'react-bootstrap';
import { ErrorMessage } from '../components/MiniComponents'

import { useAppDispatch, useAppSelector } from '../hooks';
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../stateSlices/NotificationToastSlice";
import { setItems } from "../stateSlices/AuditSlice";
import LoadingBar from '../components/LoadingBar';
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import AuditRow from '../components/Audit/AuditRow';
import { Item } from "../types/API/Audit";

import { toggleActionFilterSelected, toggleActionFilterSelectedAll } from '../stateSlices/AuditSlice';
import APIClient from '../APIClients';


type Props = {
  auditPageName: string;
  searchFields: Array<string>;
  endpoint: string;
}
/**
 * Component for the parent view of the editor pages
 * 
 * @param {object} props Props for the component: auditPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters
 * @returns Parent component for all editor views
 */
function AuditParent({ auditPageName, searchFields, endpoint }: Props) {
  const dispatch = useAppDispatch()
  const items = useAppSelector(state => state.audit.items)

  useEffect(() => {
    dispatch(setPageTitle(auditPageName))
    dispatch(setBreadcrumbs([{ href: "", title: "Audit", active: true }, { href: "", title: auditPageName, active: true }]))
  }, []);

  const [search, setSearch] = useState("");
  const [showId, setShowId] = useState(false);

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    APIClient.get(`audit/${endpoint}`).then((response) => {
      if (response && response.data && response.data.status === 200) {
        dispatch(setItems(response.data.data))
        setFetched(true);
      } else if (response && response.data && response.data.status !== 200) {
        dispatch(toast({ header: response.data.error, body: response.data.message }));
        setAPIError(response.data.message);
        setFetched(true);
      }
    }).catch((error) => {
      if (error.response) {
        setError(error.response.data.message)
        dispatch(showSpinner(false))
      } else {
        setError(error.message);
        dispatch(showSpinner(false))
      }
    });
  }, [])

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error}</Alert>
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
        <Col><Form.Check type="switch" id="completed" defaultChecked={showId} onChange={e => { setShowId(e.target.checked) }} label="Show User ID instead of email" reverse /></Col>
      </Row >
      <Row><Col><DataTable headers={["Timestamp", "User", "Action", "Target ID", "Data", ""]}>
        {items.length > 0 ? items.map((item, /*index*/) => (
          renderItem(item, showId/*index*/)
        )) : <tr><td colSpan={6} style={{ textAlign: 'center' }}>No audit entries</td></tr>}
      </DataTable></Col></Row>
    </>
  }

  function onSearch(s: string) {
    setSearch(s)
  }

  function renderItem(item: Item, showId: boolean /*index: number*/) {
    if (item) {
      return <AuditRow
        key={item.id}
        /*index={index}*/
        item={item}
        search={search}
        searchFields={searchFields}
        showId={showId}
      ></AuditRow>
    } else {
      return null
    }
  }

  return (<>
    <DataLayout title={auditPageName} onSearch={onSearch}>
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
  return <AuditParent auditPageName="Tags"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "data.name", "parent"
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
  return <AuditParent auditPageName="Catalogues"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.title",
      "data.description",
    ]}
    endpoint="catalogues"
  />
}

/**
 * View for editing Topics
 * 
 * @returns Topics view for editing
 */
export function AuditTopics() {
  return <AuditParent auditPageName="Topics"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.key", "data.title", "data.description"
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
  return <AuditParent auditPageName="Requirements"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.key", "data.title", "data.description"
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
  return <AuditParent auditPageName="ExtraTypes"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.title", "data.description"
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
  return <AuditParent auditPageName="ExtraEntries"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.content",
      "data.extraType.title",
      "data.requirement.key"
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
  return <AuditParent auditPageName="Comments"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.comment",
      "data.author",
      "data.requirement.key"
    ]}
    endpoint="comments"
  />
}

/**
 * View for editing ExtraEntries
 * 
 * @returns ExtraEntries view for editing
 */
export function AuditUsers() {
  return <AuditParent auditPageName="Users"
    searchFields={[
      "timestamp", "user.email", "action", "target_id", "parent",
      "data.id",
      "data.email",
    ]}
    endpoint="users"
  />
}
