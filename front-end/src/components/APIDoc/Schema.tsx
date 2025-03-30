import { Accordion } from "react-bootstrap";
import { OpenAPIV3_1 } from "openapi-types";
import Markdown from "react-markdown";

type APISchemaProps = {
  index: string
  name: string;
  object: OpenAPIV3_1.SchemaObject;
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: item, search, searchFields, auditPageName
 * @returns Table row for editing an object
 */
export default function APISchema({ index, name, object }: APISchemaProps) {
  const markdownCode = "```"

  return <Accordion.Item eventKey={index}>
    <Accordion.Header>{name}</Accordion.Header>
    <Accordion.Body>
      <Markdown>{`${markdownCode}json\n${JSON.stringify(object, null, 3)}\n${markdownCode}`}</Markdown>
    </Accordion.Body>
  </Accordion.Item>
}