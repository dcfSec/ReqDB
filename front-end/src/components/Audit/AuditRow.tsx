import { Button } from "react-bootstrap";
import { inSearchField } from "../MiniComponents";
import { getActionBadge } from "../MiniComponents"
import { useAppSelector } from "../../hooks";
import { Item } from "../../types/API/Audit";

type Props = {
  item: Item;
  search: string;
  searchFields: Array<string>;
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: item, search, searchFields, auditPageName
 * @returns Table row for editing an object
 */
export default function AuditRow({ item, search, searchFields }: Props) {
  const selected = useAppSelector(state => state.audit.action.filterSelected)
  if (inSearchField(search, searchFields, item) && selected.indexOf(item.action) >= 0) {
    return <tr>
      <td>{item.timestamp}</td>
      <td>{item.user}</td>
      <td>{getActionBadge(item.action)}</td>
      <td>{item.target_id}</td>
      <td><code>{JSON.stringify(item.data)}</code></td>
      <td><Button>Parent Event</Button></td>
    </tr>
  }
}
