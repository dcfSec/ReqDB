import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import SearchSelectDropdown from './SearchSelectDropdown';
import { IssueType, Project } from '../../../types/API/Atlassian';
import { useEffect, useState } from 'react';
import { APIErrorToastCallback, atlassianClient, errorToastCallback, handleError, handleResult } from '../../../APIClients';

type Props = {
  project: Project;
  issueType: IssueType;
  setIssueType: (a: IssueType) => void;
  setFieldValues: (a: Record<string, unknown>) => void;
}

/**
 * Component to select the project for the jira export
 * 
 * @param {object} param Props for this component: show, setShow
 * @returns Returns a modal for viewing the own roles
 */
export default function IssueTypeSelect({ project, issueType, setIssueType, setFieldValues }: Props) {
  const [query, setQuery] = useState('');

  const [searchResults, setSearchResults] = useState<IssueType[]>([]);

  useEffect(() => {
    atlassianClient.get(`/rest/api/3/issuetype/project?projectId=${project.id}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      setSearchResults(response as IssueType[])
    }
  }, [project.id])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelectChange(key: number, event: React.SyntheticEvent) {
    setFieldValues({})
    setIssueType(searchResults[Number(key)])
  };


  return (
    <ButtonGroup className="mb-3" style={{ width: "100%" }}>
      <Button variant="outline-secondary" disabled>Issue Type:</Button>
      <Dropdown style={{ width: "80%" }} as={ButtonGroup}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "100%" }} variant="outline-secondary">{issueType.id === "" ? "Search for jira issue type" : <><img src={issueType.iconUrl} style={{ height: "1em", marginTop: "-0.2em" }} /> {issueType.name}</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle="Jira issue type..." setQuery={setQuery}>
          {searchResults.map((result, index) => {
            return (!query || result.name.toLowerCase().includes(query.toLowerCase())) ?
              <Dropdown.Item key={"issueType-" + result.id} eventKey={index} onClick={(e) => handleSelectChange(index, e)}><img src={result.iconUrl} style={{ height: "1em", marginTop: "-0.2em" }} /> {result.name}</Dropdown.Item>
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  );
}
