import { Button, Dropdown, Form, InputGroup } from 'react-bootstrap';
import SearchSelectDropdown from './SearchSelectDropdown';
import { Issue, IssueType, JiraField, JiraFieldsPaginated, Label, Option, Priority, Project, Team, User } from '../../../types/API/Atlassian';
import { useEffect, useState } from 'react';
import { APIErrorToastCallback, atlassianClient, errorToastCallback, handleError, handleResult } from '../../../APIClients';

type Props = {
  project: Project;
  issueType: IssueType;
  fieldValues: Record<string, unknown>
  setFieldValues: (a: Record<string, unknown>) => void;
}

/**
 * Component to select the project for the jira export
 * 
 * @param {object} param Props for this component: show, setShow
 * @returns Returns a modal for viewing the own roles
 */
export default function AdditionalFields({ project, issueType, fieldValues, setFieldValues }: Props) {
  const [possibleFields, setPossibleFields] = useState<JiraField[]>([]);
  const [onlyRequired, setOnlyRequired] = useState(true);

  const filterFields = ["description", "issuetype", "project", "reporter", "summary", "attachment", "issuelinks", "customfield_10000", "customfield_10019"]

  const fixedCases = ["user", "issuelink", "priority", "date", "string", "team"] // TODO: Remove. Only here for dev

  useEffect(() => {
    atlassianClient.get(`/rest/api/3/issue/createmeta/${project.id}/issuetypes/${issueType.id}`).then((response) => { // TODO: Add pagination support
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      setPossibleFields((response as JiraFieldsPaginated).fields)
      console.log((response as JiraFieldsPaginated).fields.filter(function (v) { return !filterFields.includes(v.key) && !fixedCases.includes(v.schema.type) }))
    }
  }, [project.id, issueType.id])

  const fields = possibleFields.filter(function (v) { return !filterFields.includes(v.key) && ((onlyRequired && v.required) || !onlyRequired); })

  function setFieldValue(key: string, value: object | undefined | string) {
    setFieldValues({ ...fieldValues, ...{ [key]: value } })
  }

  return (
    <>
      {
        fields.map((field, index) => (
          getAdditionalFieldModel(index, issueType.id, field, fieldValues, setFieldValue)
        ))
      }
      <Form.Check type="switch" id="required-switch" label="Show only required fields" checked={onlyRequired} onChange={() => setOnlyRequired(!onlyRequired)} />
    </>
  );
}


function getAdditionalFieldModel(index: number, issueTypeId: string, field: JiraField, fieldValues: Record<string, unknown>, setFieldValue: (key: string, value: object | undefined | string) => void) {
  switch (field.schema.type) {
    case "user":
      return <SelectUser key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
    case "issuelink":
      return <SelectIssueLink key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
    case "priority":
      return <SelectPriority key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
    case "date":
      return <SelectDate key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
    case "string":
      return <SelectString key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
    case "team":
      return <SelectTeam key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
    case "array":
      switch (field.schema.items) {
        case "option":
        case "version":
        case "component":
          return <SelectMultiOption key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
        case "string":
          return <SelectMultiString key={`extraField-${issueTypeId}-${index}`} field={field} fieldValues={fieldValues} setFieldValue={setFieldValue} />
        default:
          return <InputGroup key={field.key} className="mb-3">
            <InputGroup.Text style={{ width: "30%" }} id={`label-${field.key}`}>{field.name}</InputGroup.Text>
            <Form.Control id={`extraField-${issueTypeId}-${index}`} defaultValue="Field is currently not supported" disabled />
          </InputGroup>
      }
    default:
      return <InputGroup key={field.key} className="mb-3">
        <InputGroup.Text style={{ width: "30%" }} id={`label-${field.key}`}>{field.name}</InputGroup.Text>
        <Form.Control id={`extraField-${issueTypeId}-${index}`} defaultValue="Field is currently not supported" disabled />
      </InputGroup>
  }
}

type AdditionalFieldProps = {
  field: JiraField;
  fieldValues: Record<string, unknown>;
  setFieldValue: (key: string, value: object | undefined | string) => void;
}

function SelectUser({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const user = (fieldValues[field.key] as User)

  useEffect(() => {
    atlassianClient.get(`${field.autoCompleteUrl}${query}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      setSearchResults(response as User[])
    }
  }, [query])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelectChange(key: number, event: React.SyntheticEvent) {
    if (key === -1) {
      setFieldValue(field.key, undefined)
    } else {
      setFieldValue(field.key, searchResults[Number(key)])
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Dropdown style={{ width: "80%" }} as={Button}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "70%" }} className="btn-form-control form-control" variant="outline-secondary">{user === undefined ? `Search for ${field.name}` : <><img src={user?.avatarUrls["16x16"]} style={{ height: "1em", marginTop: "-0.2em" }} /> {user?.displayName}</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle={field.name} setQuery={setQuery}>
          <Dropdown.Item key={"user-empty"} eventKey={-1} onClick={(e) => handleSelectChange(-1, e)}>not set</Dropdown.Item>
          <Dropdown.Divider />
          {searchResults.map((result, index) => {
            return (!query || result.displayName.toLowerCase().includes(query.toLowerCase()) || result.emailAddress.toLowerCase().includes(query.toLowerCase())) ?
              <Dropdown.Item key={"user-" + result.accountId} eventKey={index} onClick={(e) => handleSelectChange(index, e)}><img src={result.avatarUrls["16x16"]} style={{ height: "1em", marginTop: "-0.2em" }} /> {result.displayName}</Dropdown.Item>
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>
  )
}

function SelectIssueLink({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Issue[]>([]);

  const issueLink = (fieldValues[field.key] as Issue)

  useEffect(() => {
    atlassianClient.get(`/rest/api/3/issue/picker?currentProjectId=&showSubTaskParent=true&currentIssueKey=null&query=${query}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      const resp = response as { sections?: Array<{ issues?: Issue[] }> } | undefined;
      if (resp && Array.isArray(resp.sections) && resp.sections.length > 0 && Array.isArray(resp.sections[0].issues)) {
        setSearchResults(resp.sections[0].issues as Issue[]);
      } else {
        setSearchResults([]);
      }
    }
  }, [query])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelectChange(key: number, event: React.SyntheticEvent) {
    if (key === -1) {
      setFieldValue(field.key, undefined)
    } else {
      setFieldValue(field.key, { ...searchResults[Number(key)], id: String(searchResults[Number(key)].id) }) // id must be fixed because the idiots at atlassian return an integer for the id but expect a string when posting data
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Dropdown style={{ width: "80%" }} as={Button}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "70%" }} className="btn-form-control form-control" variant="outline-secondary">{issueLink === undefined ? `Search for ${field.name}` : <><img src={`${atlassianClient.defaults.baseURL}${issueLink?.img}`} style={{ height: "1em", marginTop: "-0.2em" }} /> {issueLink?.key}</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle={field.name} setQuery={setQuery}>
          <Dropdown.Item key={"issueLink-empty"} eventKey={-1} onClick={(e) => handleSelectChange(-1, e)}>not set</Dropdown.Item>
          <Dropdown.Divider />
          {searchResults.map((result, index) => {
            return (!query || result.key.toLowerCase().includes(query.toLowerCase()) || result.summaryText.toLowerCase().includes(query.toLowerCase())) ? // TODO: Add filter for issues who cannot be issueLink of current selected issue type
              <Dropdown.Item key={"issueLink-" + result.key} eventKey={index} onClick={(e) => handleSelectChange(index, e)}><img src={`${atlassianClient.defaults.baseURL}${result.img}`} style={{ height: "1em", marginTop: "-0.2em" }} /> {`[${result.key}] ${result.summaryText}`}</Dropdown.Item>
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>
  )
}

function SelectPriority({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  const [query, setQuery] = useState('');
  const searchResults = field.allowedValues as Priority[]

  const priority = (fieldValues["priority"] as Priority)

  useEffect(() => {
    if (priority === undefined && field.defaultValue) {
      setFieldValue("priority", field.defaultValue)
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelectChange(key: number, event: React.SyntheticEvent) {
    if (key === -1) {
      setFieldValue("priority", undefined)
    } else {
      setFieldValue("priority", searchResults[Number(key)])
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>Priority</InputGroup.Text>
      <Dropdown style={{ width: "80%" }} as={Button}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "70%" }} className="btn-form-control form-control" variant="outline-secondary">{priority === undefined ? `Search for priority` : <><img src={priority.iconUrl} style={{ height: "1em", marginTop: "-0.2em" }} /> {priority?.name}</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle="priority" setQuery={setQuery}>
          <Dropdown.Item key={"priority-empty"} eventKey={-1} onClick={(e) => handleSelectChange(-1, e)}>not set</Dropdown.Item>
          <Dropdown.Divider />
          {searchResults.map((result, index) => {
            return (!query || result.name.toLowerCase().includes(query.toLowerCase()) || result.name.toLowerCase().includes(query.toLowerCase())) ?
              <Dropdown.Item key={"priority-" + result.name} eventKey={index} onClick={(e) => handleSelectChange(index, e)}><img src={result?.iconUrl} style={{ height: "1em", marginTop: "-0.2em" }} /> {result.name}</Dropdown.Item>
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SelectDate({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  function handleSelectChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (event.target.value === "") {
      setFieldValue(field.key, undefined)
    } else {
      setFieldValue(field.key, event.target.value)
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Form.Control id={`input-${field.key}`} defaultValue={field.hasDefaultValue ? field.defaultValue : undefined} type="date" onChange={(e) => handleSelectChange(e)} />
    </InputGroup>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SelectString({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  function handleSelectChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (event.target.value === "") {
      setFieldValue(field.key, undefined)
    } else {
      setFieldValue(field.key, event.target.value)
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Form.Control id={`input-${field.key}`} defaultValue={field.hasDefaultValue ? field.defaultValue : undefined} onChange={(e) => handleSelectChange(e)} />
    </InputGroup>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SelectTeam({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team>();

  useEffect(() => {
    atlassianClient.get(`/rest/api/2/jql/autocompletedata/suggestions?fieldName=Team%5BTeam%5D&fieldValue=${query}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      const resp = response as { results?: Team[] } | undefined;
      if (resp && Array.isArray(resp.results)) {
        setSearchResults((resp.results as Team[]).map((team) => ({ ...team, displayName: team.displayName.replaceAll(/<\/?b>/g, "") })));
      } else {
        setSearchResults([]);
      }
    }
  }, [query])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelectChange(key: number, event: React.SyntheticEvent) {
    if (key === -1) {
      setFieldValue(field.key, undefined)
      setSelectedTeam(undefined)
    } else {
      setFieldValue(field.key, searchResults[Number(key)].value)
      setSelectedTeam(searchResults[Number(key)])
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Dropdown style={{ width: "80%" }} as={Button}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "70%" }} className="btn-form-control form-control" variant="outline-secondary">{selectedTeam === undefined ? `Search for ${field.name}` : <>{selectedTeam?.displayName}</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle={field.name} setQuery={setQuery}>
          <Dropdown.Item key={"team-empty"} eventKey={-1} onClick={(e) => handleSelectChange(-1, e)}>not set</Dropdown.Item>
          <Dropdown.Divider />
          {searchResults.map((result, index) => {
            return (!query || result.displayName.toLowerCase().includes(query.toLowerCase())) ?
              <Dropdown.Item key={"team-" + result.value} eventKey={index} onClick={(e) => handleSelectChange(index, e)}>{result.displayName}</Dropdown.Item>
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>
  )
}

function SelectMultiOption({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  const [query, setQuery] = useState('');
  const searchResults = field.allowedValues as Option[]

  const option = (fieldValues[field.key] as Option[])

  function handleSelectChange(key: number, event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      let value = fieldValues[field.key]
      if (value === undefined) {
        value = []
      }
      setFieldValue(field.key, [...value as Option[], searchResults[Number(key)]])
    } else {
      setFieldValue(field.key, (fieldValues[field.key] as Option[]).filter(function (v: Option) { return v.id !== searchResults[Number(key)].id; }))
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Dropdown style={{ width: "80%" }} as={Button}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "70%" }} className="btn-form-control form-control" variant="outline-secondary">{option === undefined ? `Search for option` : <>{option.length} option(s) selected</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle="option" setQuery={setQuery}>
          {searchResults.map((result, index) => {
            return (!query || result.value?.toLowerCase().includes(query.toLowerCase()) || result.name?.toLowerCase().includes(query.toLowerCase())) ?
              <Form.Check key={"option-" + result.value || result.name} onChange={(e) => handleSelectChange(index, e)} label={result.value || result.name} />
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>
  )
}


function SelectMultiString({ field, fieldValues, setFieldValue }: AdditionalFieldProps) {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Label[]>([]);

  const label = (fieldValues[field.key] as Label[])

  useEffect(() => {
    atlassianClient.get(`/rest/api/2/jql/autocompletedata/suggestions?fieldName=labels&fieldValue=${query}`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    function okCallback(response: unknown) {
      const resp = response as { results?: Label[] } | undefined;
      if (resp && Array.isArray(resp.results)) {
        setSearchResults((resp.results as Label[]).map((label) => ({ ...label, displayName: label.displayName.replaceAll(/<\/?b>/g, "") })));
      } else {
        setSearchResults([]);
      }
    }
  }, [query])

  function handleSelectChange(key: number, event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      let value = fieldValues[field.key]
      if (value === undefined) {
        value = []
      }
      setFieldValue(field.key, [...value as string[], searchResults[Number(key)].value])
    } else {
      setFieldValue(field.key, (fieldValues[field.key] as string[]).filter(function (v: string) { return v !== searchResults[Number(key)].value; }))
    }
  };

  return (
    <InputGroup className="mb-3" style={{ width: "100%" }}>
      <InputGroup.Text style={{ width: "30%" }}>{field.name}</InputGroup.Text>
      <Dropdown style={{ width: "80%" }} as={Button}>
        <Dropdown.Toggle id="jira-issueType-search" style={{ width: "70%" }} className="btn-form-control form-control" variant="outline-secondary">{label === undefined ? `Search for option` : <>{label.length} option(s) selected</>}</Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%", padding: "1em" }} as={SearchSelectDropdown} searchTitle={field.name} setQuery={setQuery}>
          {searchResults.map((result, index) => {
            return (!query || result.displayName.toLowerCase().includes(query.toLowerCase())) ?
              <Form.Check key={"label-" + result.value} onChange={(e) => handleSelectChange(index, e)} label={result.displayName} />
              : null
          }
          )}
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>

  )
}