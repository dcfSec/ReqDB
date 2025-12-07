import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Badge, Form } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAppSelector } from '../hooks'
import { addRows, addTopicFilterItems, addExtraHeader } from '../stateSlices/BrowseSlice';
import store from '../store'
import { Button } from "react-bootstrap";
import { CSSProperties, JSX, useEffect, useState } from 'react';
import { Item as Topic } from '../types/API/Topics';
import { Item as Requirement } from '../types/API/Requirements';
import { BrowseState, Row } from '../types/Generics';

type SearchFunction = (a: string) => void;

/**
 * Component for the main logo which is replaced by a spinner if something is loading
 * 
 * @param {object} props Props for the component: show
 * @returns Logo/Spinner component
 */
export function MainLogoSpinner() {
  const visible = useAppSelector(state => state.mainLogoSpinner.visible)
  if (visible) {
    return <><Spinner animation="grow" size="sm" />{'  '}</>
  } else {
    return <><FontAwesomeIcon icon={"database"} />{'  '}</>
  }
}

/**
 * Component for displaying breadcrumbs of the current page
 * 
 * @returns Breadcrumbs of the page
 */
export function MainBreadcrumb() {
  const breadcrumbs = useAppSelector(state => state.layout.breadcrumbs)
  return (
    <Breadcrumb>
      <Breadcrumb.Item active={true}>ReqDB</Breadcrumb.Item>
      {breadcrumbs.map(({ title, href, active }, index) => (
        <Breadcrumb.Item key={index} href={href} active={active}>{title}</Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
}


type SearchFieldProps = {
  title: string;
  onSearch: SearchFunction;
  autoFocus?: boolean;
  style?: CSSProperties | undefined;
}

/**
 * Component for the searchfield
 * 
 * @param {object} props Props for the component: title, search, onsearch
 * @returns Searchfield component
 */
export function SearchField({ title, onSearch, autoFocus = false, style = undefined }: SearchFieldProps): JSX.Element {

  const [query, setQuery] = useState("")

  useEffect(() => {
    const timeOutId = setTimeout(() => onSearch(query), 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return (
    <Form.Control type="text" id="search" placeholder={`Search for ${title}`} value={query} onChange={e => { setQuery(e.target.value) }} autoFocus={autoFocus} style={style}></Form.Control>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolvePath(object: Record<string, any>, path: string): any {
  return path
    .split('.')
    .reduce((o, p) => o ? o[p] : undefined, object);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolvePathAndSetElement(object: Record<string, any>, path: string, key: string, value: any): any {
  const data = path
    .split('.')
    .reduce((o, p) => o ? o[p] : undefined, object);
  data[key] = value
}

/**
 * Searches in an item for the search string
 * 
 * @param {string} search Current search term
 * @param {Array} fields Fields to search in
 * @param {object} item Current item to test the search filter
 * @returns True if the search term is included in the item
 */
export function inSearchField(search: string, fields: Array<string>, item: object) {
  if (search === "") {
    return true
  }

  let r = false
  fields.forEach(field => {
    if (String(resolvePath(item, field)).toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())) {
      r = true
    }
  });
  return r
}

/**
 * Returns an array of filtered items
 * 
 * @param {string} search Search string for filter
 * @param {Array} item Items to filter
 * @returns Array of filtered items
 */
export function inFilterField(search: string = "", item: Array<string>) {
  return item.some(r => r.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
}

/**
 * Parses the error message from the API and returns it as readable HTML
 * 
 * @param {string|Array<string>|Record<string, Array<string>>} message Message from the API
 * @returns Error message HTML formatted
 */
export function ErrorMessage(message: string | Array<string> | Record<string, Array<string>>) {
  let errorLines = null
  if (Array.isArray(message)) {
    errorLines = <>{message.map((line, index) => (
      <p key={index}>{typeof line === "string" ? line : JSON.stringify(line)}</p>
    ))}</>
  } else if (typeof message === "object") {
    errorLines = <ul>
      {Object.keys(message).map((m, index) => (
        <li key={index}>Key <code>{m}</code>:<ul>
          {message[m].map((line) => (
            <li key={index}>{line}</li>
          ))}
        </ul></li>
      ))}
    </ul>
  } else if (typeof message === "string") {
    errorLines = <p>{message}</p>
  } else {
    errorLines = <p>{JSON.stringify(message)}</p>
  }
  return errorLines
}

/**
 * Builds an array with rows containing the requirements for the Browse views.
 * The array is stored in the Browse state
 * 
 * @param {Object} extraHeaders Object containing the extra headers
 * @param {Array} tagFilterItems Array containing a list with the tags of the requirements
 * @param {Object} topics Object containing the topics of the requirements
 * @param {Object} item A requirement
 */
export async function buildRows(extraHeaders: object, tagFilterItems: Array<string>, topics: Array<Topic>, item: Topic, requirements: Array<Row> = [], root: boolean = true, basePath: string = "topics") {
  const dispatch = store.dispatch;
  const topicFilterItems = store.getState().browse.topics.filterItems;

  const processRequirement = (requirement: Requirement, index: number) => {
    const tags: Array<string> = [];
    if (requirement.visible) {
      if (requirement.tags.length === 0 && !tagFilterItems.includes("No Tags")) {
        tagFilterItems.push("No Tags");
      }
      requirement.tags.forEach(tag => {
        tags.push(tag.name);
        if (!tagFilterItems.includes(tag.name)) {
          tagFilterItems.push(tag.name);
        }
      });
      const base = {
        id: requirement.id,
        visible: true,
        selected: false,
        path: `${basePath}.requirements.${index}`,
        Tags: tags,
        Topics: [...topics],
        Key: requirement.key,
        Title: requirement.title,
        Description: requirement.description,
        Comments: requirement.comments || [],
      };
      const extraColumns: { [key: string]: string } = {};
      requirement.extras.forEach(extra => {
        extraColumns[extra.extraType.title] = extra.content;
        if (!Object.keys(extraHeaders).includes(extra.extraType.title)) {
          const header: { [key: string]: 1 | 2 | 3 } = {};
          header[extra.extraType.title] = extra.extraType.extraType;
          dispatch(addExtraHeader(header));
        }
      });
      requirements.push({ ...base, ...extraColumns });
    }
  };

  const processTopic = async (topic: Topic, index: number) => {
    if (!topicFilterItems.includes(`${topic.key} ${topic.title}`)) {
      dispatch(addTopicFilterItems(`${topic.key} ${topic.title}`));
    }
    let newPath = ""
    if (basePath === "topics") {
      newPath = `${basePath}.${index}`
    } else {
      newPath = `${basePath}.children.${index}`
    }
    await buildRows(extraHeaders, tagFilterItems, [...topics, topic], topic, requirements, false, newPath);
  };

  const requirementPromises = item.requirements ? item.requirements.map(processRequirement) : [];
  const topicPromises = item.children ? item.children.map(processTopic) : [];

  await Promise.all([...requirementPromises, ...topicPromises]);

  if (root) {
    dispatch(addRows(requirements));
  }
}

/**
 * 
 * @param {string} str String to truncate
 * @param {number} n Length of the string to truncate after
 * @returns {string} String with '...' added when truncated
 */
export function truncate(str: string, n: number): string {
  return (str.length > n) ? str.slice(0, n - 1) + "..." : str;
};

type SaveItemFunction = () => void;
type SetEditFunction = (a: boolean) => void;
type ResetTempItemFunction = () => void;
type SetShowDeleteModalFunction = (a: boolean) => void;

type EditButtonProps = {
  saveItem: SaveItemFunction;
  edit: boolean;
  setEdit: SetEditFunction;
  resetTempItem: ResetTempItemFunction;
  setShowDeleteModal: SetShowDeleteModalFunction;
  small?: boolean;
  deletable?: boolean;
}

/**
 * 
 * @param {object} props Props for this component: saveItem, edit, setEdit, resetTempItem, setShowDeleteModal
 * @returns 2 Buttons for an edit row
 */
export function EditButtons({ saveItem, edit, setEdit, resetTempItem, setShowDeleteModal, small = false, deletable = true }: EditButtonProps): JSX.Element {
  if (edit) {
    return <><Button variant="success" size={small ? "sm" : undefined} onClick={() => saveItem()}>Save</Button>{' '}<Button variant="danger" size={small ? "sm" : undefined} onClick={() => { setEdit(false); resetTempItem() }}>Cancel</Button></>
  } else {
    return <><Button variant="success" size={small ? "sm" : undefined} onClick={() => setEdit(true)}>Edit</Button>{' '}{deletable ? <Button variant="danger" size={small ? "sm" : undefined} onClick={() => setShowDeleteModal(true)}>Delete</Button> : null}</>
  }
}


export function isVisible(state: BrowseState, row: Row) {
  return inSearchField(state.search, Object.keys(row), row)
    && (/* tagFilterSelected.length === 0 || */ row.Tags.some(r => state.tags.filterSelected.indexOf(r) >= 0) || (row.Tags.length === 0 && state.tags.filterSelected.indexOf("No Tags") >= 0))
    && row.Topics.some(r => state.topics.filterSelected.indexOf(`${r.key} ${r.title}`) >= 0)
}

export function getActionBadge(action: string) {
  if (action == "INSERT") {
    return <Badge bg="success">INSERT</Badge>
  }
  else if (action == "UPDATE") {
    return <Badge bg="warning">UPDATE</Badge>
  }
  else if (action == "DELETE") {
    return <Badge bg="danger">DELETE</Badge>
  }
}

export function toISOStringWithTimezone(date: Date) {
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  const getTimezoneOffset = (date: Date) => {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    return diff + pad(tzOffset / 60) + ':' + pad(tzOffset % 60);
  };
  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    getTimezoneOffset(date);
};

/** 
 * Save blob as file (See https://github.com/eligrey/FileSaver.js/issues/774)
 * 
 * @param {Blob} blob
 * @param {string} name
*/
export function saveAs(blob: Blob, name: string) {
  // Namespace is used to prevent conflict w/ Chrome popup Blocker extension (Issue https://github.com/eligrey/FileSaver.js/issues/561)
  const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement
  a.download = name
  a.rel = 'noopener'
  a.href = URL.createObjectURL(blob)

  a.click()
  URL.revokeObjectURL(a.href)

  // setTimeout(() => URL.revokeObjectURL(a.href), 40 /* sec */ * 1000)
  // setTimeout(() => a.click(), 0)
}