import { Button } from "react-bootstrap";
import { inSearchField } from "../MiniComponents";
import { getActionBadge } from "../MiniComponents"
import { useAppSelector } from "../../hooks";
import { Item } from "../../types/API/Audit";

type Props = {
  item: Item;
  search: string;
  searchFields: Array<string>;
  auditPageName: string
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: item, search, searchFields, auditPageName
 * @returns Table row for editing an object
 */
export default function AuditRow({ item, search, searchFields, auditPageName }: Props) {
  const selected = useAppSelector(state => state.audit.action.filterSelected)
  let row = <></>
  if (inSearchField(search, searchFields, item) && selected.indexOf(item.verb) >= 0) {
    switch (auditPageName) {
      case "Catalogues":
        row = <CatalogueAuditRow item={item} />
        break;
      case "ExtraEntries":
        row = <ExtraEntryAuditRow item={item} />
        break;
      case "ExtraTypes":
        row = <ExtraTypeAuditRow item={item} />
        break;
      case "Requirements":
        row = <RequirementAuditRow item={item} />
        break;
      case "Tags":
        row = <TagAuditRow item={item} />
        break;
      case "Topics":
        row = <TopicAuditRow item={item} />
        break;
        case "Comments":
          row = <CommentAuditRow item={item} />
          break;
      default:
        row = <></>
        break;
    }
    return row
  }
}

type TypeProps = {
  item: Item
}


/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function TagAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}

/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function CatalogueAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.title}</td>
      <td>{item.description}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}

/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function ExtraEntryAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.content}</td>
      <td>{item.extraTypeId}</td>
      <td>{item.requirementId}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}
/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function ExtraTypeAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.title}</td>
      <td>{item.description}</td>
      <td>{["None", "Text", "Markdown", "Badges"][item.extraType]}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}
/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function RequirementAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.key}</td>
      <td>{item.title}</td>
      <td>{item.description}</td>
      <td>{item.parentId}</td>
      <td>{item.visible ? "True" : "False"}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}

/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function TopicAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.key}</td>
      <td>{item.title}</td>
      <td>{item.description}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}
/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: item
 * @returns Table row for audit of an object
 */
export function CommentAuditRow({ item }: TypeProps) {

  return (
    <tr>
      <td>{item.transaction.issued_at}</td>
      <td>{item.transaction.user_id}</td>
      <td>{getActionBadge(item.verb)}</td>
      <td>{item.id}</td>
      <td>{item.comment}</td>
      <td>{item.author}</td>
      <td>{item.completed ? "True" : "False"}</td>
      <td>{item.requirementId}</td>
      <td><Button>Parent Event</Button></td>
    </tr>
  );
}