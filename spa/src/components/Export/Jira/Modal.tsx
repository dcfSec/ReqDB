import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Container, Row, Spinner, Stack } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { showSpinner } from '../../../stateSlices/MainLogoSpinnerSlice';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../../../APIClients';
import { APISuccessData, Row as RowType } from '../../../types/Generics';
import { toast } from '../../../stateSlices/NotificationToastSlice';
import { useEffect, useState } from 'react';
import IssueTypeSelect from './IssueTypeSelect';
import { setAtlassianToken, setAtlassianTokenExpiresAt } from '../../../stateSlices/AtlassianSlice';
import { IssueType, Project, Token } from '../../../types/API/Atlassian';
import ProjectSelect from './ProjectSelect';
import AdditionalFields from './AdditionalFields';


type Props = {
  show: boolean;
  setShow: (a: boolean) => void;
  rowsToExport: RowType[];
}

/**
 * Modal for exporting requirements
 * 
 * @param {object} param Props for this component: show, setShow
 * @returns Returns a modal for viewing the own roles
 */
export default function JiraExportModal({ show, setShow, rowsToExport }: Props) {
  const dispatch = useAppDispatch()

  const spinner = useAppSelector(state => state.mainLogoSpinner.visible)
  const atlassianUser = useAppSelector(state => state.atlassian.user)
  const atlassianToken = useAppSelector(state => state.atlassian.token)

  const [project, setProject] = useState<Project>({ id: "", key: "", name: "", avatarUrls: {} });
  const [issueType, setIssueType] = useState<IssueType>({ id: "", name: "", iconUrl: "", subtask: false });
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});

  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    getAtlassianToken()
  }, [])

  function getAtlassianToken() {
    dispatch(showSpinner(true))
    APIClient.get("/export/jira/token").then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: APISuccessData) {
      dispatch(setAtlassianToken((response.data as Token).access_token))
      dispatch(setAtlassianTokenExpiresAt((response.data as Token).expires_at))
      setConfigLoaded(true)
    }
  }

  function exportRequirements() {
    dispatch(showSpinner(true))
    APIClient.post(`/export/jira/${project.id}/${issueType.id}`, { items: rowsToExport.map((row) => (row.id)), extraFields: fieldValues }).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(toast({ header: "Jira Issue Created", body: "Selected requirements where created as Jira issues" }))
      setProject({ "id": "", key: "", name: "", avatarUrls: {} });
      setShow(false)
    }
  }

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="JiraModal"
      onHide={() => { setShow(false) }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="JiraModal">
          Export requirements to Jira
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
              {(spinner && !configLoaded) || atlassianToken === "" ? <Stack className="col-md-1 mx-auto" style={{ marginTop: "1em" }}><Spinner animation="border" /></Stack> :
                <>
                  <ProjectSelect project={project} setProject={setProject} setIssueType={setIssueType} setFieldValues={setFieldValues} />
                  {project.id !== "" ? <IssueTypeSelect project={project} issueType={issueType} setIssueType={setIssueType} setFieldValues={setFieldValues} /> : null}
                  {project.id !== "" && issueType.id !== "" ? <AdditionalFields project={project} issueType={issueType} fieldValues={fieldValues} setFieldValues={setFieldValues} /> : null}
                </>
              }
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <span style={{ marginRight: "auto" }}>Logged in as <span style={{ fontStyle: "italic" }}>{atlassianUser}</span></span>
        <Button variant="success" onClick={() => exportRequirements()} disabled={project.id === "" || issueType.id === ""}>Export</Button>
        <Button variant="primary" onClick={() => { setProject({ "id": "", key: "", name: "", avatarUrls: {} }); setShow(false) }}>Cancel</Button> {/* Add State Cleanup when cancel and after export*/}
      </Modal.Footer>
    </Modal>
  );
}
