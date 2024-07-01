import { Children, forwardRef, useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import { useSelector, useDispatch } from 'react-redux'
import { toggleTagFilterSelected, toggleTagFilterSelectedAll } from '../stateSlices/BrowseSlice';

/**
 * Component for a custom dropdown menu with a checkbox
 * 
 * @param {object} props Props for the component: index, children, style, className, labeledBy
 * @returns Returns dropdown menu with checkboxes
 */
export const CheckboxDropdown = forwardRef(({ index, children, style, className, 'aria-labelledby': labeledBy }, ref) => {
  const [value, setValue] = useState('');

  const dispatch = useDispatch()
  const selected = useSelector(state => state.browse.tags.filterSelected)
  const allSelected = useSelector(state => state.browse.tags.allSelected)


  function handleCheckboxChange(changeEvent) {
    const { id } = changeEvent.target;
    dispatch(toggleTagFilterSelected(id))
  };

  function handleCheckboxChangeAll(changeEvent) {
    const { checked } = changeEvent.target;
    dispatch(toggleTagFilterSelectedAll(checked))
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
