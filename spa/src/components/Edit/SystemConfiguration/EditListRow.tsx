import Form from 'react-bootstrap/Form';
import { Item } from '../../../types/API/Configuration';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


type Props = {
  item: Item
  updateTempItem: (a: object) => void;
  edit: boolean
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function ConfigurationEditListRow({ item, updateTempItem, edit }: Props) {

  let value = <></>

  switch (item.type) {
    case "string":
      value = <td><Form.Control disabled={!edit} type="text" id="value" value={item.value} onChange={e => { updateTempItem({ value: e.target.value }) }} /></td>
      break;
    case "boolean":
      value = <td><Form.Check disabled={!edit} type="switch" id="value" defaultChecked={item.value === "true"} onChange={e => { updateTempItem({ value: e.target.checked ? "true" : "false" }) }} /></td>
      break;
    case "text":
      value = <td><Form.Control as="textarea" rows={3} id="value" disabled={!edit} value={item.value} onChange={e => { updateTempItem({ value: e.target.value }) }} /></td>
      break;
    default:
      break;
  }

  return (
    <>
      <td>{item.category}</td>
      <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${item.key}`}>{item.description}</Tooltip>}><td>{item.key}</td></OverlayTrigger>
      {value}
    </>
  );
}
