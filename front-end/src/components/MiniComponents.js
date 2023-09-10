import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Form } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

export function MainLogoSpinner(props) {
  const { show } = props
  if (show) {
    return <><Spinner animation="grow" size="sm"/>{'  '}</>
  } else {
    return <><FontAwesomeIcon icon={solid("database")} />{'  '}</>
  }
}

export function MainBreadcrumb(props) {
  const { items } = props
  return (
    <Breadcrumb>
      <Breadcrumb.Item active={true}>ReqDB</Breadcrumb.Item>
      {items.map(({title, href, active}, index) => (
          <Breadcrumb.Item key={index} href={href} active={active}>{title}</Breadcrumb.Item>
        ))}
    </Breadcrumb>
  );
}

export function SearchField(props) {
    const { title, search, onSearch } = props
    return (
        <Form.Control type="text" id="search" placeholder={`Search for ${title}`} value={search}  onChange={e => {onSearch(e.target.value)}}></Form.Control>
    );
  }

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

export function inFilterField(search="", item) {
  return item.some(r=> r.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
}