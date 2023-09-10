import { ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
