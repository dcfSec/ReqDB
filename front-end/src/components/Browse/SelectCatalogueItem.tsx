import { Badge, ListGroup, OverlayTrigger, Stack, Tooltip, TooltipProps } from 'react-bootstrap';
import { Link } from 'react-router';
import { Item } from '../../types/API/Catalogues';
import { RefAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';

type Props = {
  catalogue: Item;
}
/**
 * Component for a list item for the catalogues selection list
 * 
 * @param {object} props Props for this component: catalogue
 * @returns Returns a list item for a catalogue
 */
export default function SelectCatalogueItem({ catalogue }: Props) {
  const renderTooltip = (props: JSX.IntrinsicAttributes & TooltipProps & RefAttributes<HTMLDivElement>) => (
    <Tooltip id="button-tooltip" {...props}>
      {catalogue.description}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="left"
      overlay={renderTooltip}
    >
      <ListGroup.Item action as={Link} to={`${catalogue.id}`}>
        <Stack direction="horizontal" gap={1}>
          {catalogue.title}
          {catalogue.tags.map((item) => (
            <Badge key={`tag-${item.id}`} bg="secondary" className={"lowerButton"}>{item.name}</Badge>
          ))}
        </Stack>
      </ListGroup.Item>
    </OverlayTrigger>
  );
}
