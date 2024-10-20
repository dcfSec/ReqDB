import { Children, forwardRef, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import { useSelector, useDispatch } from 'react-redux'

/**
 * Component for a custom dropdown menu with a checkbox
 * 
 * @param {object} props Props for the component: index, children, style, className, labeledBy
 * @returns Returns dropdown menu with checkboxes
 */
export const CheckboxDropdown = forwardRef(({ index, children, style, className, 'aria-labelledby': labeledBy , target, toggleChangeAll, toggleChange}, ref) => {
  const [value, setValue] = useState('');

  let selected 
  let allSelected

  const dispatch = useDispatch()
  if (target == "tag") {
    selected = useSelector(state => state.browse.tags.filterSelected)
    allSelected = useSelector(state => state.browse.tags.allSelected)
  } else if (target == "action") {
    selected = useSelector(state => state.audit.action.filterSelected)
    allSelected = useSelector(state => state.audit.action.allSelected)
  }


  function handleCheckboxChange(changeEvent) {
    const { id } = changeEvent.target;
    dispatch(toggleChange(id))
  };

  function handleCheckboxChangeAll(changeEvent) {
    const { checked } = changeEvent.target;
    dispatch(toggleChangeAll(checked))
  };

  return (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}
    >
      <Form.Control autoFocus className="mx-3 my-2 w-auto" placeholder="Type to filter..." onChange={(e) => setValue(e.target.value)} value={value} />
      <ul>
        <Form.Check key="all" id="_all" type="switch" label="All" style={{ paddingLeft: "1.5em" }} onChange={handleCheckboxChangeAll} checked={allSelected} />
        <Dropdown.Divider />
        {Children.toArray(children).map((child, index) => {
          return !value || child.props.children.toLowerCase().includes(value.toLowerCase()) ?
            <Form.Check key={"" + index + child.props.children} id={child.props.children} type="switch" label={child.props.children} style={{ paddingLeft: "1.5em" }} onChange={handleCheckboxChange} checked={selected.includes(child.props.children)} />
            : null
        }
        )}
      </ul>
    </div>
  );
},);
