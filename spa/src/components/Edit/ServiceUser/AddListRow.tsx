import Form from 'react-bootstrap/Form';
import { Item as ServiceUser } from '../../../types/API/ServiceUser';


type Props = {
  newItem: ServiceUser;
  updateNewItem: (a: object) => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem
 * @returns A table row to add an item
 */
export function ServiceUserAddListRow({ newItem, updateNewItem }: Props) {

  return (
    <>
      <td><Form.Control type="text" id="id" value={newItem.id} onChange={e => { updateNewItem({ id: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="email" value={newItem.email} onChange={e => { updateNewItem({ email: e.target.value }) }} /></td>
      <td></td>
    </>
  );
}
