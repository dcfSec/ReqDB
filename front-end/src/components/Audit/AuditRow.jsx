import { Button } from "react-bootstrap";
import { inSearchField } from "../MiniComponents";
import { useSelector } from 'react-redux'
import { getActionBadge } from "../MiniComponents"

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, search, searchFields, auditPageName
 * @returns Table row for editing an object
 */
export default function AuditRow({ index, item, search, searchFields, auditPageName }) {
  const selected = useSelector(state => state.audit.action.filterSelected)
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

/**
 * Component for a audit row for an object
 * 
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function TagAuditRow({ index, item }) {

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
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function CatalogueAuditRow({ index, item }) {

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
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function ExtraEntryAuditRow({ index, item }) {

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
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function ExtraTypeAuditRow({ index, item }) {

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
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function RequirementAuditRow({ index, item }) {

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
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function TopicAuditRow({ index, item }) {

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
 * @param {object} props Props for this component: index, item
 * @returns Table row for audit of an object
 */
export function CommentAuditRow({ index, item }) {

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