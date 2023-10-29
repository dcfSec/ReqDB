import { ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Component for a list item for the catalogues selection list
 * 
 * @param {object} props Props for this component: catalogue
 * @returns Returns a list item for a catalogue
 */
export default function SelectCatalogueItem({ catalogue }) {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {catalogue.description}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="left"
      overlay={renderTooltip}
    >
      <ListGroup.Item action as={Link} to={`${catalogue.id}`}>{catalogue.title}</ListGroup.Item>
    </OverlayTrigger>
  );
}
