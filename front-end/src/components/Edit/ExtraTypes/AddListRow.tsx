import Form from 'react-bootstrap/Form';
import { Type } from '../../../types/API/Extras';

type Props = {
  newItem: Type
  updateNewItem: (a: object) => void;
}
/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: newItem, updateNewItem, postItem
 * @returns A table row to add an item
 */
export function ExtraTypeAddListRow({ newItem, updateNewItem }: Props) {

  return (
    <>
      <td></td>
      <td><Form.Control type="text" id="name" value={newItem.title} onChange={e => { updateNewItem({ title: e.target.value }) }} /></td>
      <td><Form.Control type="text" id="description" value={newItem.description} onChange={e => { updateNewItem({ description: e.target.value }) }} /></td>
      <td>
        <Form.Select id="extratype" aria-label="ExtraType type" defaultValue={newItem.extraType} onChange={e => { updateNewItem({ extraType: e.target.value }) }}>
          <option>Select the type</option>
          <option value="1">Plaintext</option>
          <option value="2">Markdown</option>
          <option value="3">Badges</option>
        </Form.Select>
      </td>
      <td></td>
    </>
  );
}
