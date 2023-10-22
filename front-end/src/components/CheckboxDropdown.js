import { Children, forwardRef, useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

/**
 * Component for a custom dropdown menu with a checkbox
 * 
 * @param {object} props Props for the component: index, children, style, className, labeledBy, setFilteredItem, filteredItem, filterItems
 * @returns Returns dropdown menu with checkboxes
 */
export const CheckboxDropdown = forwardRef(({ index, children, style, className, 'aria-labelledby': labeledBy, setFilteredItem, filteredItem, filterItems }, ref) => {
  const [value, setValue] = useState('');
  const [allChecked, setAllChecked] = useState(true);

  useEffect(() => { arrayIsEqual(filteredItem, filterItems) ? setAllChecked(true) : setAllChecked(false) }, [filteredItem]);

  function handleCheckboxChange(changeEvent) {
    const { id } = changeEvent.target;

    if (!filteredItem.includes(id)) {
      setFilteredItem([...filteredItem, ...[id]])
    } else {
      const tempItem = filteredItem.filter(function (v) { return v !== id; });
      setFilteredItem([...tempItem]);

    }
  };

  function arrayIsEqual(a1, a2) {
    return JSON.stringify(a1.sort()) === JSON.stringify(a2.sort());
  }

  function handleCheckboxChangeAll(changeEvent) {
    const { checked } = changeEvent.target;

    if (checked === true) {
      setFilteredItem([...filterItems])
    } else {
      setFilteredItem([]);
    }
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
        <Form.Check key="all" id="_all" type="switch" label="All" style={{ paddingLeft: "1.5em" }} onChange={handleCheckboxChangeAll} checked={allChecked} />
        <Dropdown.Divider />
        {Children.toArray(children).map((child, index) => {
          return !value || child.props.children.toLowerCase().includes(value.toLowerCase()) ?
            <Form.Check key={"" + index + child.props.children} id={child.props.children} type="switch" label={child.props.children} style={{ paddingLeft: "1.5em" }} onChange={handleCheckboxChange} checked={filteredItem.includes(child.props.children)} />
            : null
        }
        )}
      </ul>
    </div>
  );
},);
