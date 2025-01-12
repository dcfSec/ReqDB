import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
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


  switch (item.type) {
    case "string":
      return (
        <FloatingLabel controlId={item.key} label={`${item.key}: ${item.description}`}>
          <Form.Control type="text" value={item.value} onChange={e => { dispatch(editConfigurationItem({ key: item.key, value: e.target.value })) }} />
        </FloatingLabel>
      );
    case "text":
      return (
        <FloatingLabel controlId={item.key} label={`${item.key}: ${item.description}`}>
          <Form.Control as="textarea" style={{ height: '5rem' }} value={item.value} onChange={e => { dispatch(editConfigurationItem({ key: item.key, value: e.target.value })) }} />
        </FloatingLabel>
      );
    case "boolean":
      return (
        <FloatingLabel controlId={item.key} label={`${item.key}: ${item.description}`}>
          <Form.Select aria-label={`${item.key}: ${item.description}`} defaultValue={item.value} onChange={e => { dispatch(editConfigurationItem({ key: item.key, value: e.target.value })) }}>
            <option value="false">false</option>
            <option value="true">true</option>
          </Form.Select>
        </FloatingLabel>
      );
    default:
      return null
  }
}
