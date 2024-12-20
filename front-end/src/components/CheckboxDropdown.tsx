import { Children, CSSProperties, forwardRef, ReactNode, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useAppDispatch, useAppSelector } from '../hooks';
import React from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';


type Props = {
  //index: number;
  children: ReactNode;
  style: CSSProperties | undefined;
  className: string;
  'aria-labelledby': string; 
  target: string;
  toggleChangeAll: ActionCreatorWithPayload<boolean, "audit/toggleActionFilterSelectedAll"> | ActionCreatorWithPayload<boolean, "browse/toggleTagFilterSelectedAll">;
  toggleChange: ActionCreatorWithPayload<string, "audit/toggleActionFilterSelected"> | ActionCreatorWithPayload<string, "browse/toggleTagFilterSelected">;
}

/**
 * Component for a custom dropdown menu with a checkbox
 * 
 * @param {object} props Props for the component: index, children, style, className, labeledBy
 * @returns Returns dropdown menu with checkboxes
 */
const CheckboxDropdown = forwardRef<HTMLInputElement, Props>(({ /*index,*/ children, style, className, 'aria-labelledby': labeledBy , target, toggleChangeAll, toggleChange}, ref) => {
  const [value, setValue] = useState('');

  let selected: Array<string>
  let allSelected: boolean = false

  const dispatch = useAppDispatch()
  if (target == "tag") {
    selected = useAppSelector(state => state.browse.tags.filterSelected)
    allSelected = useAppSelector(state => state.browse.tags.allSelected)
  } else if (target == "action") {
    selected = useAppSelector(state => state.audit.action.filterSelected)
    allSelected = useAppSelector(state => state.audit.action.allSelected)
  }


  function handleCheckboxChange(changeEvent: React.ChangeEvent<HTMLInputElement>) {
    const { id } = changeEvent.target;
    dispatch(toggleChange(id));
  };

  function handleCheckboxChangeAll(changeEvent: React.ChangeEvent<HTMLInputElement>) {
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
          return React.isValidElement(child) && (!value || (child.props as { children: string }).children.toLowerCase().includes(value.toLowerCase())) ?
            <Form.Check key={"" + index + (child.props as { children: string }).children} id={(child.props as { children: string }).children} type="switch" label={(child.props as { children: string }).children} style={{ paddingLeft: "1.5em" }} onChange={handleCheckboxChange} checked={selected.includes((child.props as { children: string }).children)} />
            : null
        }
        )}
      </ul>
    </div>
  );
},);

CheckboxDropdown.displayName = "CheckboxDropdown";

export default CheckboxDropdown;