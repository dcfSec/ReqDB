import Form from 'react-bootstrap/Form';
import { FloatingLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Item } from "../../types/API/Configuration";
import { useAppDispatch } from '../../hooks';
import { editConfigurationItem } from '../../stateSlices/ConfigurationSlice';


type Props = {
  item: Item;
}

/**
 * Component to add a item in the editor table
 * 
 * @param {object} props Props for the component: item
 * @returns A configuration item
 */
export function ConfigurationItem({ item }: Props) {
  const dispatch = useAppDispatch()

  let setting = <></>

  switch (item.type) {
    case "string":
      setting = <FloatingLabel controlId={item.key} label={`${item.key}: ${item.description}`}>
          <Form.Control type="text" value={item.value} onChange={e => { dispatch(editConfigurationItem({ key: item.key, value: e.target.value })) }} />
        </FloatingLabel>
      break;
    case "text":
      setting = <FloatingLabel controlId={item.key} label={`${item.key}: ${item.description}`}>
          <Form.Control as="textarea" style={{ height: '5rem' }} value={item.value} onChange={e => { dispatch(editConfigurationItem({ key: item.key, value: e.target.value })) }} />
        </FloatingLabel>
      break;
    case "boolean":
      setting = <FloatingLabel controlId={item.key} label={`${item.key}: ${item.description}`}>
          <Form.Select aria-label={`${item.key}: ${item.description}`} defaultValue={item.value} onChange={e => { dispatch(editConfigurationItem({ key: item.key, value: e.target.value })) }}>
            <option value="false">false</option>
            <option value="true">true</option>
          </Form.Select>
        </FloatingLabel>
      break;
    default:
      break;
  }

  if (item.description != "") {
    return (
      <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip"> {item.description} </Tooltip>}>
        {setting}
      </OverlayTrigger>
    );
  } else {
    return setting
  }
}
