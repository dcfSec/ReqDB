import Form from 'react-bootstrap/Form';
import { Item } from '../../../types/API/ServiceUser';
import { toISOStringWithTimezone } from '../../MiniComponents';


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
export function ServiceUserEditListRow({ item, updateTempItem, edit }: Props) {

  return (
    <>
      <td><Form.Control disabled={true} type="text" id="id" value={item.id} /></td>
      <td><Form.Control disabled={!edit} type="text" id="email" value={item.email} onChange={e => { updateTempItem({ email: e.target.value }) }} /></td>
      <td><Form.Control disabled={true} type="text" id="created" value={toISOStringWithTimezone(new Date(item.created * 1000))} /></td>
    </>
  );
}
