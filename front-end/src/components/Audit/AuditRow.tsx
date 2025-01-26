import { Button } from "react-bootstrap";
import { inSearchField, toISOStringWithTimezone, getActionBadge } from "../MiniComponents";
import { useAppSelector } from "../../hooks";
import { Item } from "../../types/API/Audit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { regular } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useState } from "react";
import Markdown from "react-markdown";

type Props = {
  item: Item;
  search: string;
  searchFields: Array<string>;
  showId: boolean;
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: item, search, searchFields, auditPageName
 * @returns Table row for editing an object
 */
export default function AuditRow({ item, search, searchFields, showId }: Props) {
  const [expand, setExpand] = useState(false);
  const markdownCode = "```"

  const selected = useAppSelector(state => state.audit.action.filterSelected)
  if (inSearchField(search, searchFields, item) && selected.indexOf(item.verb) >= 0) {
    return <tr>
      <td>{toISOStringWithTimezone(new Date(item.timestamp * 1000))}</td>
      <td>{showId ? item.user.id : item.user.email}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.target_id}</td>
      <td><Button onClick={() => { setExpand(!expand) }} className="eye-button" variant="primary-outline"><FontAwesomeIcon icon={expand ? regular("eye-slash") : regular("eye")} /></Button></td>
      <td>{expand ? <Markdown>{`${markdownCode}json\n${JSON.stringify(item.data, null, 2)}\n${markdownCode}`}</Markdown> : <code>{JSON.stringify(item.data)}</code>}</td>
    </tr>
  }
}
