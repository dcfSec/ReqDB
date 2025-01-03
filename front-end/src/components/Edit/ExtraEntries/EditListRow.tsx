import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { JSX, useState } from "react";
import SelectParentModal from "../SelectParentModal";
import { truncate } from "../../MiniComponents";
import { Item } from '../../../types/API/Extras';


type Props = {
  item: Item
  buttons: JSX.Element
  updateTempItem: (a: object) => void;
  edit: boolean
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: index, item,  buttons, updateTempItem, edit
 * @returns Table row for editing an object
 */
export function ExtraEntryEditListRow({ item,  buttons, updateTempItem, edit }: Props) {

  const [showSelectParentModal, setShowSelectParentModal] = useState(false);
  const [showSelectExtraModal, setShowSelectExtraModal] = useState(false);

    return (
      <tr>
        <td>{item.id}</td>
        <td><Form.Control as="textarea" disabled={!edit} rows={3} id="content" value={item.content} onChange={e => { updateTempItem({ content: e.target.value }) }} /></td>
        <td><Button variant="primary" disabled={!edit} onClick={() => {
          setShowSelectExtraModal(true)
        }}>{item.extraType ? item.extraType.title : "ExtraType"}</Button></td>
        <td><Button variant="primary" disabled={!edit} onClick={() => {
          setShowSelectParentModal(true)
        }}>{item.requirement ? item.requirement.key : "Requirement"}</Button></td>
        <td>{buttons}</td>
        {showSelectParentModal ? <SelectParentModal
          itemId={item.id}
          humanKey={`[${truncate(item.content, 12)}]`}
          show={showSelectParentModal}
          setShow={setShowSelectParentModal}
          initialSelectedItem={item.requirementId}
          endpoint={"requirements"}
          updateItem={updateTempItem}
          updateIdField={"requirementId"}
          updateObjectField={"requirement"}
          checkCircle={false}
          columns={["key", "title"]}
        ></SelectParentModal> : null}
        {showSelectExtraModal ? <SelectParentModal
          itemId={item.id}
          humanKey={`[${truncate(item.content, 12)}]`}
          show={showSelectExtraModal}
          setShow={setShowSelectExtraModal}
          initialSelectedItem={item.extraTypeId}
          endpoint={"extraTypes"}
          updateItem={updateTempItem}
          updateIdField={"extraTypeId"}
          updateObjectField={"extraType"}
          checkCircle={false}
          columns={["title"]}
        ></SelectParentModal> : null}
      </tr>
    );
}
