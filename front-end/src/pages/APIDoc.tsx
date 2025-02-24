import { Accordion, Alert, Button, Col, Row } from "react-bootstrap";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { useEffect, useState } from "react";
import APIClient, { handleError, handleResult } from "../APIClient";
import LoadingBar from "../components/LoadingBar";
import { toast } from "../stateSlices/NotificationToastSlice";
import { APIErrorData, APISuccessData } from "../types/Generics";
import { ErrorMessage, saveAs } from "../components/MiniComponents";
import { OpenAPI, OpenAPIV3_1 } from "openapi-types";
import APIPath from "../components/APIDoc/Path";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSpec } from "../stateSlices/APIDocSlice";


/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function APIDoc() {
  const dispatch = useAppDispatch()

  const apiSpec = useAppSelector(state => state.apiDoc.spec)

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState<string | Array<string> | Record<string, Array<string>> | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Home", active: true }]))
    dispatch(setPageTitle("Home"))

    dispatch(showSpinner(true))

  }, []);

  useEffect(() => {
    dispatch(showSpinner(true));
    APIClient.get(`openapi.json`).then((response) => {
      handleResult(response, okCallback, APIErrorCallback)
    }).catch((error) => {
      handleError(error, APIErrorCallback, errorCallback)
    });
  }, [])

  async function parseSwagger(response: OpenAPI.Document) {
    dispatch(setSpec(response as OpenAPIV3_1.Document))
  }

  function okCallback(response: APISuccessData) {
    parseSwagger(response as unknown as OpenAPI.Document)
    .then(() => {
      setFetched(true);
    })
    .catch((err) => {
      console.error(err);
      setError(err);
      setFetched(true);
    });
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

  function exportJson() {
    const fileType = 'data:text/json;charset=utf-8;';
    const json = JSON.stringify(apiSpec, null, 2);
    const blob = new Blob([json], { type: fileType });
    saveAs(blob, "openapi.json");
  }

  let body = <LoadingBar />

  if (error) {
    body = <Alert variant="danger">Error loading OpenAPI data. Error: {error}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched && apiSpec) {

    body = <>
      <Row>
        <Col><Button onClick={exportJson}>Export openAPI.json</Button></Col>
      </Row>
      <Row>
        <Accordion defaultActiveKey="0" flush>
          {apiSpec.paths && Object.keys(apiSpec.paths).map((key, index) => { 
            return apiSpec.paths && apiSpec.servers ? <APIPath key={index} index={index} pathName={`${apiSpec.servers[0].url}${key}`} pathProperties={apiSpec.paths[key] as OpenAPIV3_1.PathItemObject} /> : null 
          })}
        </Accordion>
      </Row>
    </>
  }

  return <>
    <Row>
      <Col><h1>OpenAPI Documentation</h1></Col>
    </Row>
    {body}
  </>;
};
