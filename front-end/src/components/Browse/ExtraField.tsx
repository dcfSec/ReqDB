import { Badge } from "react-bootstrap";
import Markdown from 'react-markdown'


type Props = {
  index: number;
  extraType: 1 | 2 | 3;
  item: string;
  lineBreak: boolean
}

/**
 * Component for an extra field view
 * 
 * @param {object} props Props for this component: index, extraType, item
 * @returns An extra field
 */
export default function ExtraField({ index, extraType, item, lineBreak = false }: Props) {

  let badgeIdExtraFieldRunner = 0

  if (extraType === 1) {
    return item
  } else if (extraType === 2) {
    return <Markdown>{item}</Markdown>
  } else if (extraType === 3) {
    return item ? item.split(";").map((badge) => (<span key={"extraFieldBade" + index + "-" + ++badgeIdExtraFieldRunner}><Badge bg="secondary">{badge}</Badge>{lineBreak ? <br/> : ' '}</span>)) : null
  }
}