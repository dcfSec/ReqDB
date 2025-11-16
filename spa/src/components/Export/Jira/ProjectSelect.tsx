import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import SearchSelectDropdown from './SearchSelectDropdown';
import { IssueType, JiraPaginatedResponse, Project } from '../../../types/API/Atlassian';
import { useEffect, useState } from 'react';
import { APIErrorToastCallback, atlassianClient, errorToastCallback, handleError, handleResult } from '../../../APIClients';

type Props = {
  project: Project;
  setProject: (a: Project) => void;
  setIssueType: (a: IssueType) => void;
  setFieldValues: (a: Record<string, unknown>) => void;
}

/**
 * Component to select the project for the jira export
 * 
 * @param {object} param Props for this component: show, setShow
 * @returns Returns a modal for viewing the own roles
 */
export default function ProjectSelect({ project, setProject, setIssueType, setFieldValues }: Props) {
  const [query, setQuery] = useState('');

  const [searchResults, setSearchResults] = useState<Project[]>([]);

  useEffect(() => {
    atlassianClient.get(`/rest/api/3/project/search?query=${query}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      console.log(error)
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      setSearchResults((response as JiraPaginatedResponse).values as Project[])
    }
  }, [query])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelectChange(key: number, event: React.SyntheticEvent) {
    setIssueType({ id: "", name: "", iconUrl: "", subtask: false })
    setFieldValues({})
    setProject(searchResults[Number(key)])
  };


  return (
    <ButtonGroup className="mb-3" style={{ width: "100%" }}>
      <Button variant="outline-secondary" disabled>Jira Project:</Button>
      <Dropdown style={{ width: "80%" }} as={ButtonGroup}>
        <Dropdown.Toggle id="jira-project-search" style={{ width: "100%" }} variant="outline-secondary">{project.id === "" ? "Search for jira projects" : <><img src={project.avatarUrls["16x16"]} style={{ height: "1em", marginTop: "-0.1em" }} /> [{project.key}] {project.name}</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle="Jira project..." setQuery={setQuery}>
          {searchResults.map((result, index) => {
            return (!query || result.name.toLowerCase().includes(query.toLowerCase()) || result.key.toLowerCase().includes(query.toLowerCase())) ?
              <Dropdown.Item key={"project-" + result.id} eventKey={index} onClick={(e) => handleSelectChange(index, e)}><img src={result.avatarUrls["16x16"]} style={{ height: "1em", marginTop: "-0.1em" }} /> [{result.key}] {result.name}</Dropdown.Item>
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  );
}
