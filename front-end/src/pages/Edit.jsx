import { useState, useEffect } from 'react';
import EditorLayout from '../components/Edit/EditLayout';
import EditTable from '../components/Edit/EditTable';

import { Alert } from 'react-bootstrap';
import { ErrorMessage } from '../components/MiniComponents'
import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { protectedResources } from '../authConfig';

import { useSelector, useDispatch } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../stateSlices/NotificationToastSlice";
import { setItems } from "../stateSlices/EditSlice";
import AddListRowSkeleton from "../components/Edit/AddListRowSkeleton";
import EditListRowSkeleton from "../components/Edit/EditListRowSkeleton";
import LoadingBar from '../components/LoadingBar';

/**
 * Component for the parent view of the editor pages
 * 
 * @param {object} props Props for the component: editPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters
 * @returns Parent component for all editor views
 */
function EditParent({ editPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters = [] }) {
  const dispatch = useDispatch()
  const items = useSelector(state => state.edit.items)

  document.title = `${editPageName} | ReqDB - Requirement Database`;

  const [search, setSearch] = useState("");

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    execute("GET", `${endpoint}?${parameters.join("&")}`).then((response) => {
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
    body = <EditTable headers={headers}>
      <AddListRowSkeleton endpoint={endpoint} blankItem={blankItem} humanKey={humanKey} editPageName={editPageName} />
      {items.map((item, index) => (
        renderItem(item, index)
      ))}
    </EditTable>
  }
  function onSearch(s) {
    setSearch(s)
  }

  function renderItem(item, index) {
    if (item) {
      return <EditListRowSkeleton
        key={item.id}
        index={index}
        endpoint={endpoint}
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
    <EditorLayout title={editPageName} search={search} onSearch={onSearch}>
      {body}
    </EditorLayout>
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
    }}
    searchFields={[
      "name"
    ]}
    endpoint="tags"
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
      root: null
    }}
    searchFields={[
      "title",
      "description"
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
    }}
    searchFields={[
      "key", "title", "description"
    ]}
    endpoint="topics"
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
    }}
    searchFields={[
      "key", "title", "description"
    ]}
    endpoint="requirements"
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
    }}
    searchFields={[
      "title", "description"
    ]}
    endpoint="extraTypes"
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
    }}
    searchFields={[
      "content",
      "extraType.title",
      "requirement.key"
    ]}
    endpoint="extraEntries"
    parameters={[]}
  />
}
