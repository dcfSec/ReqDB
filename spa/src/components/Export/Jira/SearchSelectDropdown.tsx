import { CSSProperties, forwardRef, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { SearchField } from '../../MiniComponents';


type Props = {
  //index: number;
  children: ReactNode;
  style: CSSProperties | undefined;
  className: string;
  'aria-labelledby': string;
  searchTitle: string;
  setQuery: (a: string) => void;
}

/**
 * ....
 * 
 * @param {object} props Props for the component: index, children, style, className, labeledBy
 * @returns Returns dropdown menu with checkboxes
 */
const SearchSelectDropdown = forwardRef<HTMLInputElement, Props>(({ /*index,*/ children, style, className, 'aria-labelledby': labeledBy, setQuery, searchTitle }, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}
    >
      <SearchField title={searchTitle} autoFocus={true} onSearch={setQuery} />
      <Dropdown.Divider />
      <ul className="list-unstyled">
        {children}
      </ul>
    </div>
  );
},);

SearchSelectDropdown.displayName = "SearchSelectDropdown";

export default SearchSelectDropdown;
