import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Form } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useSelector } from 'react-redux'
import { addRow, addTopicFilterItems, addExtraHeader } from '../stateSlices/BrowseSlice';
import store from '../store'

/**
 * Component for the main logo which is replaced by a spinner if something is loading
 * 
 * @param {object} props Props for the component: show
 * @returns Logo/Spinner component
 */
export function MainLogoSpinner() {
  const visible = useSelector(state => state.mainLogoSpinner.visible)
  if (visible) {
    return <><Spinner animation="grow" size="sm" />{'  '}</>
  } else {
    return <><FontAwesomeIcon icon={solid("database")} />{'  '}</>
  }
}

/**
 * Component for displaying breadcrumbs of the current page
 * 
 * @param {object} props Props for the component: items
 * @returns Breadcrumbs of the page
 */
export function MainBreadcrumb(props) {
  const { items } = props
  return (
    <Breadcrumb>
      <Breadcrumb.Item active={true}>ReqDB</Breadcrumb.Item>
      {items.map(({ title, href, active }, index) => (
        <Breadcrumb.Item key={index} href={href} active={active}>{title}</Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
}

/**
 * Component for the searchfield
 * 
 * @param {object} props Props for the component: tilte, search, onsearch
 * @returns Searchfield component
 */
export function SearchField(props) {
  const { title, search, onSearch } = props
  return (
    <Form.Control type="text" id="search" placeholder={`Search for ${title}`} value={search} onChange={e => { onSearch(e.target.value) }}></Form.Control>
  );
}

/**
 * Searches in an item for the search string
 * 
 * @param {string} search Current search term
 * @param {Array} fields Fields to search in
 * @param {object} item Current item to test the search filter
 * @returns True if the search term is included in the item
 */
export function inSearchField(search, fields, item) {
  if (search === "") {
    return true
  }
  const resolvePath = (object, path, defaultValue) => path
    .split('.')
    .reduce((o, p) => o ? o[p] : defaultValue, object)

  let r = false
  fields.forEach(field => {
    if (String(resolvePath(item, field)).toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
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
export function inFilterField(search = "", item) {
  return item.some(r => r.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
}

/**
 * Parses the error message from the API and returns it as readable HTML
 * 
 * @param {string|array|object} message Message from the API
 * @returns Error message HTML formatted
 */
export function ErrorMessage(message) {
  let errorLines = null
  if (Array.isArray(message)) {
    errorLines = <>{message.map((line, index) => (
      <p key={index}>{line}</p>
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
export function buildRows(extraHeaders, tagFilterItems, topics, item) {
  const dispatch = store.dispatch
  const topicFilterItems = store.getState().browse.topics.filterItems

  if ('requirements' in item) {
    item.requirements.forEach(requirement => {
      const tags = []
      if (requirement.visible === true) {
        if (requirement.tags.length == 0 && !tagFilterItems.includes("No Tags")) {
          tagFilterItems.push("No Tags")
        }
        requirement.tags.forEach(tag => {
          tags.push(tag.name)
          if (!tagFilterItems.includes(tag.name)) {
            tagFilterItems.push(tag.name)
          }
        });
        const base = {
          id: requirement.id,
          Tags: tags,
          Topics: [...topics],
          Key: requirement.key,
          Title: requirement.title,
          Description: requirement.description,
          Comments: ('comments' in requirement) ? requirement.comments : [],
        }
        const extraColumns = {}
        requirement.extras.forEach(extra => {
          extraColumns[extra.extraType.title] = extra.content
          if (!Object.keys(extraHeaders).includes(extra.extraType.title)) {
            const header = {}
            header[extra.extraType.title] = extra.extraType.extraType
            dispatch(addExtraHeader(header))
          }
        });
        dispatch(addRow({ ...base, ...extraColumns }))
      }
    });
  }
  if ('children' in item) {
    item.children.forEach(topic => {
      if (!topicFilterItems.includes(`${topic.key} ${topic.title}`)) {
        dispatch(addTopicFilterItems(`${topic.key} ${topic.title}`))
      }
      buildRows(extraHeaders, tagFilterItems, [...topics, topic], topic)
    });
  }
}