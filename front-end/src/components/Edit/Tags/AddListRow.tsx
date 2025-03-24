import Form from 'react-bootstrap/Form';
import { Item as Tag } from "../../../types/API/Tags";

type Props = {
  newItem: Tag
  updateNewItem: (a: object) => void;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function TagAddListRow({ newItem, updateNewItem }: Props) {

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="name" placeholder="New Tag name" value={newItem.name} onChange={e => { updateNewItem({ name: e.target.value }) }} /></td>
      <td></td>
      <td></td>
    </>
  );
}
