import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import SelectMany from "../SelectManyModal";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal";


/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item, buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function ExtraTypeEditListRow({ index, item, buttons, updateTempItem, edit }) {

  const [showUpdateMany2Many, setShowUpdateMany2Many] = useState(false);

    return (
      <tr>
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
        <td>{buttons}</td>
        {showUpdateMany2Many ? <SelectMany
          humanKey={item.key}
          show={showUpdateMany2Many}
          setShow={setShowUpdateMany2Many}
          initialSelectedItems={item.tags}
          endpoint="tags"
          columns={["name"]}
          updateKey={"tags"}
          updateItem={updateTempItem}
          name="tag"
        ></SelectMany> : null}
      </tr>
    );
}
