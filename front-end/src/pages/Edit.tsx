import { Col, Row } from "react-bootstrap";
import { useState, useEffect } from 'react';
import DataLayout from '../components/DataLayout';
import DataTable from '../components/DataTable';

import { Alert } from 'react-bootstrap';
import { ErrorMessage } from '../components/MiniComponents'
import { useAppDispatch, useAppSelector } from "../hooks";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../stateSlices/NotificationToastSlice";
import { setItems } from "../stateSlices/EditSlice";
import AddListRowSkeleton from "../components/Edit/AddListRowSkeleton";
import EditListRowSkeleton from "../components/Edit/EditListRowSkeleton";
import LoadingBar from '../components/LoadingBar';
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";

import { Item as Catalogue } from '../types/API/Catalogues';
import { Item as Extra } from '../types/API/Extras';
import { Type } from '../types/API/Extras';
import { Item as Requirement } from "../types/API/Requirements";
import { Item as Tag } from "../types/API/Tags";
import { Item as Topic } from "../types/API/Topics";
import APIClient, { handleError, handleResult } from "../APIClient";
import { APIErrorData, APISuccessData, GenericItem } from "../types/Generics";

type Props = {
  editPageName: string;
  humanKey: string;
  headers: Array<string>;
  blankItem: Catalogue | Extra | Type | Requirement | Tag | Topic;
  searchFields: Array<string>;
  endpoint: string;
  needCascade: boolean;
  parameters?: Array<string>
}

/**
 * Component for the parent view of the editor pages
 * 
 * @param {object} props Props for the component: editPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters
 * @returns Parent component for all editor views
 */
function EditParent({ editPageName, humanKey, headers, blankItem, searchFields, endpoint, needCascade, parameters = [] }: Props) {
  const dispatch = useAppDispatch()
  const items = useAppSelector(state => state.edit.items)

  useEffect(() => {
    dispatch(setPageTitle(editPageName))
    dispatch(setBreadcrumbs([{ href: "", title: "Edit", active: true }, { href: "", title: editPageName, active: true }]))
  }, []);

  const [search, setSearch] = useState("");

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState<string | Array<string> | Record<string, Array<string>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(showSpinner(true));
    APIClient.get(`${endpoint}?${parameters.join("&")}`).then((response) => {
      handleResult(response, okCallback, APIErrorCallback)
    }).catch((error) => {
      handleError(error, APIErrorCallback, errorCallback)
    });
  }, [])

  function okCallback(response: APISuccessData) {
    dispatch(setItems(response.data as GenericItem[]))
    setFetched(true);
  }

  function APIErrorCallback(response: APIErrorData) {
    dispatch(toast({ header: response.error, body: response.message as string }));
    setAPIError(response.message);
    setFetched(true);
  }

  function errorCallback(error: string) {
    setError(error);
    setFetched(true);
  }

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    body = <Row><Col><DataTable headers={headers}>
      <AddListRowSkeleton endpoint={endpoint} blankItem={blankItem} humanKey={humanKey} editPageName={editPageName} />
      {items.map((item, index) => (
        renderItem(item, index, needCascade)
      ))}
    </DataTable></Col></Row>
  }
  function onSearch(s: string) {
    setSearch(s)
  }

  function renderItem(item: Catalogue | Extra | Type | Requirement | Tag | Topic, index: number, needCascade: boolean) {
    if (item) {
      return <EditListRowSkeleton
        key={item.id}
        index={index}
        endpoint={endpoint}
        needCascade={needCascade}
        originalItem={item}
        search={search}
        searchFields={searchFields}
        editPageName={editPageName}
        humanKey={humanKey}
      ></EditListRowSkeleton>
    } else {
      return null
    }
  }

  return (<>
    <DataLayout title={editPageName} search={search} onSearch={onSearch}>
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
export function Tags() {
  return <EditParent editPageName="Tags" humanKey="name"
    headers={[
      "#",
      "Name",
      "Requirements",
      "Action"
    ]}
    blankItem={{
      name: "",
    } as Tag}
    searchFields={[
      "name"
    ]}
    endpoint="tags"
    needCascade={true}
    parameters={["minimal"]}
  />
}

/**
 * View for editing Catalogues
 * 
 * @returns Catalogues view for editing
 */
export function Catalogues() {
  return <EditParent editPageName="Catalogues" humanKey="title"
    headers={[
      "#",
      "Title",
      "Description",
      "Root Elements",
      "Action"
    ]}
    blankItem={{
      title: "",
      description: "",
    } as Catalogue}
    searchFields={[
      "title",
      "description"
    ]}
    endpoint="catalogues"
    needCascade={true}
    parameters={["nested"]}
  />
}

/**
 * View for editing Topics
 * 
 * @returns Topics view for editing
 */
export function Topics() {
  return <EditParent editPageName="Topics" humanKey="key"
    headers={[
      "#",
      "Key",
      "Title",
      "Description",
      "Parent",
      "Children",
      "Action"
    ]}
    blankItem={{
      key: "",
      title: "",
      description: "",
      parentId: null,
    } as unknown as Topic}
    searchFields={[
      "key", "title", "description"
    ]}
    endpoint="topics"
    needCascade={true}
    parameters={[]}
  />
}

/**
 * View for editing Requirements
 * 
 * @returns Requirements view for editing
 */
export function Requirements() {
  return <EditParent editPageName="Requirements" humanKey="key"
    headers={[
      "#",
      "Key",
      "Title",
      "Description",
      "Parent",
      "Tags",
      "Extras",
      "Visible",
      "Action"
    ]}
    blankItem={{
      key: "",
      title: "",
      description: "",
      parentId: null,
      visible: true,
    } as unknown as Requirement}
    searchFields={[
      "key", "title", "description"
    ]}
    endpoint="requirements"
    needCascade={false}
    parameters={[]}
  />
}

/**
 * View for editing ExtraTypes
 * 
 * @returns ExtraTypes view for editing
 */
export function ExtraTypes() {
  return <EditParent editPageName="ExtraTypes" humanKey="title"
    headers={[
      "#",
      "Title",
      "Description",
      "Type",
      "Children",
      "Action"
    ]}
    blankItem={{
      title: "",
      description: "",
      extraType: null
    } as unknown as Type}
    searchFields={[
      "title", "description"
    ]}
    endpoint="extraTypes"
    needCascade={false}
    parameters={[]}
  />
}

/**
 * View for editing ExtraEntries
 * 
 * @returns ExtraEntries view for editing
 */
export function ExtraEntries() {
  return <EditParent editPageName="ExtraEntries" humanKey="id"
    headers={[
      "#",
      "Content",
      "ExtraType",
      "Requirement",
      "Action"
    ]}
    blankItem={{
      content: "",
      extraType: "",
      requirementId: null,
      parent: null,
    } as unknown as Extra}
    searchFields={[
      "content",
      "extraType.title",
      "requirement.key"
    ]}
    endpoint="extraEntries"
    needCascade={false}
    parameters={[]}
  />
}
