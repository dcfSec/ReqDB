import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { Type } from '../../../types/API/Extras';


type Props = {
  item: Type
  updateTempItem: (a: object) => void;
  edit: boolean
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function ExtraTypeEditListRow({ item, updateTempItem, edit }: Props) {

    return (
      <>
        <td>{item.id}</td>
        <td><Form.Control type="text" id="name" disabled={!edit} value={item.title} onChange={e => { updateTempItem({ title: e.target.value }) }} /></td>
        <td><Form.Control type="text" id="description" disabled={!edit} value={item.description} onChange={e => { updateTempItem({ description: e.target.value }) }} /></td>
        <td>
          <Form.Select id="extratype" aria-label="ExtraType type" disabled={!edit} defaultValue={item.extraType} onChange={e => { updateTempItem({ extraType: e.target.value }) }}>
            <option value="1">Plaintext</option>
            <option value="2">Markdown</option>
            <option value="3">Badges</option>
          </Form.Select>
        </td>
        <td><Button variant="primary">Show</Button></td>
      </>
    );
}
