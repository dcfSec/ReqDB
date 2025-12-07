import { Col, Form, Row, Stack } from "react-bootstrap";
import { useState, useEffect } from 'react';
import DataLayout from '../DataLayout';
import DataTable from '../DataTable';

import { Alert } from 'react-bootstrap';
import { ErrorMessage } from '../MiniComponents'
import { useAppDispatch, useAppSelector } from "../../hooks";
import { showSpinner } from "../../stateSlices/MainLogoSpinnerSlice";
import { toast } from "../../stateSlices/NotificationToastSlice";
import { setItems, toggleSelectAll } from "../../stateSlices/EditSlice";
import AddListRowSkeleton from "../Edit/AddListRowSkeleton";
import EditListRowSkeleton from "../Edit/EditListRowSkeleton";
import LoadingBar from '../LoadingBar';
import { setBreadcrumbs, setPageTitle } from "../../stateSlices/LayoutSlice";

import { Item as Catalogue } from '../../types/API/Catalogues';
import { Item as Extra } from '../../types/API/Extras';
import { Type } from '../../types/API/Extras';
import { Item as Requirement } from "../../types/API/Requirements";
import { Item as Tag } from "../../types/API/Tags";
import { Item as Topic } from "../../types/API/Topics";
import { Item as ServiceUser } from "../../types/API/ServiceUser";
import { Item as Configuration } from "../../types/API/Configuration";
import APIClient, { handleError, handleResult } from "../../APIClients";
import { APIErrorData, APISuccessData, GenericItem } from "../../types/Generics";
import { BatchActionDropdown } from "../Edit/BatchAction";

type Props = {
  editPageName: string;
  humanKey: string;
  headers: Array<string>;
  blankItem: Catalogue | Extra | Type | Requirement | Tag | Topic | ServiceUser | Configuration;
  searchFields: Array<string>;
  endpoint: string;
  needCascade: boolean;
  parameters?: Array<string>
  deletable?: boolean;
  selectable?: boolean;
}

/**
 * Component for the parent view of the editor pages
 * 
 * @param {object} props Props for the component: editPageName, humanKey, headers, blankItem, searchFields, endpoint, parameters
 * @returns Parent component for all editor views
 */
export function EditParent({ editPageName, humanKey, headers, blankItem, searchFields, endpoint, needCascade, parameters = [], deletable = true, selectable = true }: Props) {
  const dispatch = useAppDispatch()
  const items = useAppSelector(state => state.edit.items)
  const selectedCount = useAppSelector(state => state.edit.selectedCount)

  useEffect(() => {
    dispatch(setPageTitle(editPageName))
    dispatch(setBreadcrumbs([{ href: "", title: "Edit", active: true }, { href: "", title: editPageName, active: true }]))
  }, []);

  const [search, setSearch] = useState("");

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState<string | Array<string> | Record<string, Array<string>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actionHeaders = [<>Action</>]

  if (selectable) {
    actionHeaders.push(<><Form.Check key={"selectAll"} inline id={"selectAll"} type="checkbox" aria-label="All" label={`(${selectedCount}/${items.length})`} onChange={() => { dispatch(toggleSelectAll()) }} checked={selectedCount == items.length} /></>)
  }

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
    body = <Row><Col><DataTable headers={[...headers, ...actionHeaders]}>
      <AddListRowSkeleton endpoint={endpoint} blankItem={blankItem} humanKey={humanKey} editPageName={editPageName} />
      {items.length > 0 ? items.map((item, index) => (
        renderItem(item, index, needCascade)
      )) : <tr><td colSpan={[...headers, ...actionHeaders].length} style={{ textAlign: 'center' }}>No items</td></tr>}
    </DataTable></Col></Row>
  }

  function onSearch(s: string) {
    setSearch(s)
  }

  function renderItem(item: Catalogue | Extra | Type | Requirement | Tag | Topic | ServiceUser | Configuration, index: number, needCascade: boolean) {
    if (item) {
      return <EditListRowSkeleton
        key={'key' in item ? (item as Configuration).key : item.id}
        index={index}
        endpoint={endpoint}
        needCascade={needCascade}
        search={search}
        searchFields={searchFields}
        editPageName={editPageName}
        humanKey={humanKey}
        deletable={deletable}
        selectable={selectable}
      ></EditListRowSkeleton>
    } else {
      return null
    }
  }

  return (<>
    <DataLayout title={editPageName} onSearch={onSearch}>
      <Row>
        <Col>
          <Stack direction="horizontal" gap={0}>
            <div className="ms-auto">{selectedCount > 0 && deletable ? <BatchActionDropdown needCascade={needCascade} endpoint={endpoint} humanKey={humanKey}></BatchActionDropdown> : null}</div>
          </Stack>
        </Col>
      </Row>
      {body}
    </DataLayout>
  </>
  );

}