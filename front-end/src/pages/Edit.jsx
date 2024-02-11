import { useState, lazy, useEffect } from 'react';
import EditorLayout from '../components/Edit/EditLayout';
import DataTable from '../components/DataTable';

import { Alert, ProgressBar } from 'react-bootstrap';
import { API, handleErrorMessage } from '../static';
import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { protectedResources } from '../authConfig';

/**
 * Component for the parent view of the editor pages
 * 
 * @param {object} props Props for the component: editPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters, needsParent, setNotificationToastHandler, setShowSpinner
 * @returns Parent component for all editor views
 */
function EditParent({ editPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters = [], needsParent = false, setNotificationToastHandler, setShowSpinner }) {

  const EditListRow = lazy(() => import(`../components/Edit/${editPageName}/EditListRow.jsx`));
  const AddListRow = lazy(() => import(`../components/Edit/${editPageName}/AddListRow.jsx`));

  const [search, setSearch] = useState("");
  let [items, setItems] = useState([]);


  const [updateIdField, setUpdateIdField] = useState("");
  const [updateObjectField, setUpdateObjectField] = useState("");
  const [checkCircle, setCheckCircle] = useState(true);
  const [columns, setColumns] = useState([
    "key",
    "title"
  ]);

  const [parentEndpoint, setParentEndpoint] = useState("")

  const updateParent = {
    updateIdField: updateIdField, setUpdateIdField: setUpdateIdField,
    updateObjectField: updateObjectField, setUpdateObjectField: setUpdateObjectField,
    checkCircle: checkCircle, setCheckCircle: setCheckCircle,
    columns: columns, setColumns: setColumns,
    endpoint: parentEndpoint, setEndpoint: setParentEndpoint,
    needed: needsParent
  }

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  document.title = `${editPageName} | ReqDB - Requirement Database`;


  const [data, setData] = useState(null);
  useEffect(() => { setShowSpinner(!data) }, [data]);

  useEffect(() => {
    if (!data) {
      execute("GET", `${API}/${endpoint}?${parameters.join("&")}`).then((response) => {
        setData(response);
      });
    }
  }, [execute, data])

  let body = <ProgressBar animated now={100} />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data</Alert>
  } else {
    if (data && data.status === 200) {
      items = data.data
      body = <DataTable headers={headers} search={search} endpoint={endpoint} setItems={setItems}>
        <AddListRow addItemToList={addItem} endpoint={endpoint} blankItem={blankItem} humanKey={humanKey} tag={AddListRow} updateParent={updateParent}></AddListRow>
        {items.map((item, index) => (
          renderItem(item, index)
        ))}
      </DataTable>
    } else if (data && data.status !== 200) {
      setNotificationToastHandler([data.error, data.message, true])
      body = <Alert variant="danger">{handleErrorMessage(data.message)}</Alert>
    }
  }

  function addItem(item) {
    items.push(item)
    setItems(items)
  }

  function onSearch(s) {
    setSearch(s)
  }

  function updateItem(index, newItem) {
    const tempItems = [...items]
    tempItems[index] = newItem
    setItems(tempItems)
  }

  function deleteItem(index) {
    items.splice(index, 1);
    setItems(items)
  }

  function renderItem(item, index) {
    if (item) {
      return <EditListRow
        key={item.id}
        humanKey={humanKey}
        originalItem={item}
        index={index}
        deleteItemInList={deleteItem}
        updateItem={updateItem}
        search={search}
        endpoint={endpoint}
        tag={EditListRow}
        searchFields={searchFields}
        updateParent={updateParent}
        parentEndpoint={parentEndpoint}
        setParentEndpoint={setParentEndpoint}
        needsParent={true}
        needsMany2Many={true} ></EditListRow>
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
 * @param {object} param0 Props for the component: setShowSpinner, notificationToastHandler, setNotificationToastHandler
 * @returns Tags view for editing
 */
export function Tags({ setShowSpinner, notificationToastHandler, setNotificationToastHandler }) {
  return <EditParent editPageName="Tags" humanKey="name" setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler}
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
 * @param {object} param0 Props for the component: setShowSpinner, notificationToastHandler, setNotificationToastHandler
 * @returns Catalogues view for editing
 */
export function Catalogues({ setShowSpinner, notificationToastHandler, setNotificationToastHandler }) {
  return <EditParent editPageName="Catalogues" humanKey="title" setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler}
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
      maxDepth: 1,
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
 * @param {object} param0 Props for the component: setShowSpinner, notificationToastHandler, setNotificationToastHandler
 * @returns Topics view for editing
 */
export function Topics({ setShowSpinner, notificationToastHandler, setNotificationToastHandler }) {
  return <EditParent editPageName="Topics" humanKey="key" setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler}
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
 * @param {object} param0 Props for the component: setShowSpinner, notificationToastHandler, setNotificationToastHandler
 * @returns Requirements view for editing
 */
export function Requirements({ setShowSpinner, notificationToastHandler, setNotificationToastHandler }) {
  return <EditParent editPageName="Requirements" humanKey="key" setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler}
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
 * @param {object} param0 Props for the component: setShowSpinner, notificationToastHandler, setNotificationToastHandler
 * @returns ExtraTypes view for editing
 */
export function ExtraTypes({ setShowSpinner, notificationToastHandler, setNotificationToastHandler }) {
  return <EditParent editPageName="ExtraTypes" humanKey="title" setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler}
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
 * @param {object} param0 Props for the component: setShowSpinner, notificationToastHandler, setNotificationToastHandler
 * @returns ExtraEntries view for editing
 */
export function ExtraEntries({ setShowSpinner, notificationToastHandler, setNotificationToastHandler }) {
  return <EditParent editPageName="ExtraEntries" humanKey="id" setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler}
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
      "content"
    ]}
    endpoint="extraEntries"
    parameters={[]}
  />
}
