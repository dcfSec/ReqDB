import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Form } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

/**
 * Component for the main logo which is replaced by a spinner if something is loading
 * 
 * @param {object} props Props for the component: show
 * @returns Logo/Spinner component
 */
export function MainLogoSpinner(props) {
  const { show } = props
  if (show) {
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
  let r = false
  fields.forEach(field => {
    if (String(item[field]).toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
      r = true
    }
  });
  return r
}

/**
 * Returns an array of filtered items
 * 
 * @param {string} search Searchstring for filter
 * @param {Array} item Items to filter
 * @returns Array of filtered items
 */
export function inFilterField(search = "", item) {
  return item.some(r => r.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
}
