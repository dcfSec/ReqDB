import { Badge } from "react-bootstrap";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";


/**
 * Component for an extra field view
 * 
 * @param {object} props Props for this component: index, extraType, item
 * @returns An extra field
 */
export default function ExtraField({ index, extraType, item, lineBreak = false }) {

  let badgeIdExtraFieldRunner = 0

  if (extraType === 1) {
    return item
  } else if (extraType === 2) {
    return <ReactMarkdown>{item}</ReactMarkdown>
  } else if (extraType === 3) {
    return item ? item.split(";").map((badge) => (<span key={"extraFieldBade" + index + "-" + ++badgeIdExtraFieldRunner}><Badge bg="secondary">{badge}</Badge>{lineBreak ? <br/> : ' '}</span>)) : null
  }
}