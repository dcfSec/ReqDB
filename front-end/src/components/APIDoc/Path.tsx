import { Accordion, Tab, Table, Tabs } from "react-bootstrap";
import { OpenAPIV3_1 } from "openapi-types";
import Markdown from "react-markdown";
import { useAppSelector } from "../../hooks";

type APIPathProps = {
  index: number
  pathName: string;
  pathProperties: OpenAPIV3_1.PathItemObject;
}

/**
 * Component for a row to edit an object
 * 
 * @param {object} props Props for this component: item, search, searchFields, auditPageName
 * @returns Table row for editing an object
 */
export default function APIPath({ index, pathName, pathProperties }: APIPathProps) {

  return <>{Object.keys(pathProperties).map((key, requestIndex) => { return <APIRequest key={`${index}-${requestIndex}`} index={`${index}-${requestIndex}`} method={key} path={pathName} operation={pathProperties[key as OpenAPIV3_1.HttpMethods] as OpenAPIV3_1.OperationObject} /> })}</>

}

type APIRequestProps = {
  index: string
  method: string;
  path: string;
  operation: OpenAPIV3_1.OperationObject;
}

function APIRequest({ index, method, path, operation }: APIRequestProps) {
  return <Accordion.Item eventKey={index}>
    <Accordion.Header>{method.toUpperCase()} {path}</Accordion.Header>
    <Accordion.Body>
      {operation.parameters ? <RequestResponseTable title="Parameters" headers={["Name", "Type", "Position", "Required"]}>
        {operation.parameters.map((parameter, parameterIndex) => { return <APIRequestParameter key={`${index}-${parameterIndex}`} parameter={parameter as OpenAPIV3_1.ParameterObject} /> })}
      </RequestResponseTable> : null}
      {operation.requestBody ? <RequestResponseTable title="Request Body" headers={["Body"]}>
        <APIRequestBody body={operation.requestBody as OpenAPIV3_1.RequestBodyObject} />
      </RequestResponseTable> : null}
      <RequestResponseTable title="Response" headers={["Code", "Description", "Schema"]}>
        {operation.responses ? Object.keys(operation.responses).map((key, responseIndex) => { return operation.responses ? <APIResponse key={`${index}-${responseIndex}`} index={`${index}-${responseIndex}`} code={key} response={operation.responses[key] as OpenAPIV3_1.ResponseObject} /> : null }) : null}
      </RequestResponseTable>
    </Accordion.Body>
  </Accordion.Item>
}

type RequestResponseTableProps = {
  title: string
  headers: string[]
  children: React.ReactNode;
};

function RequestResponseTable({ title, children, headers }: RequestResponseTableProps) {
  return <><h3>{title}</h3><Table responsive striped>
    <thead>
      <tr>
        {headers.map((header, index) => { return <th key={index}>{header}</th> })}
      </tr>
    </thead>
    <tbody>
      {children}
    </tbody>
  </Table></>
}

type APIRequestParameterProps = {
  parameter: OpenAPIV3_1.ParameterObject;
};

function APIRequestParameter({ parameter }: APIRequestParameterProps) {
  return <tr>
    <td>{parameter.name}</td>
    <td>{(parameter.schema as OpenAPIV3_1.SchemaObject).type}</td>
    <td>{parameter.in}</td>
    <td>{parameter.required ? "required" : "not required"}</td>
  </tr>
}

type APIRequestBodyProps = {
  body: OpenAPIV3_1.RequestBodyObject;
};

function APIRequestBody({ body }: APIRequestBodyProps) {
  return <tr>
    <td>{schemaToJSONExample(body.content["application/json"].schema)}</td>
  </tr>
}

type APIResponseProps = {
  index: string;
  code: string;
  response: OpenAPIV3_1.ResponseObject;
}

function APIResponse({ index, code, response }: APIResponseProps) {
  return <tr key={index}>
    <td>{code}</td>
    <td>{response.description}</td><td>{response.content ? schemaToJSONExample(response.content["application/json"].schema) : null}</td>
  </tr>
}

function parseObject(obj: OpenAPIV3_1.SchemaObject | undefined, ref: string[] = []) {
  const rObj: { [key: string]: unknown } = {}
  if (obj && "properties" in obj && obj.properties) {
    Object.keys(obj.properties).forEach((key) => {
      if (obj.properties) {
        rObj[key] = getPropertyValue(obj.properties[key], ref)
      }
    });
  }
  return rObj
}


function schemaToJSONExample(schema: OpenAPIV3_1.SchemaObject | undefined) {
  const apiSpec = useAppSelector(state => state.apiDoc.spec)
  const markdownCode = "```"
  const schemas = []
  if (schema && "properties" in schema && schema.properties) {
    schemas.push(parseObject(schema))
  } else if (schema && "anyOf" in schema) {
    schema.anyOf?.forEach(item => {
      if (item && "properties" in item && item.properties) {
        schemas.push(parseObject(item))
      } else if (item && "$ref" in item && item.$ref) {
        const ref = item.$ref.split("/").at(-1)
        if (ref) {
          schemas.push(parseObject(apiSpec?.components?.schemas?.[ref] ?? {}, [ref]))
        }
      }
    });
  } else if (schema && "$ref" in schema && schema.$ref) {
    const ref = (schema.$ref as string).split("/").at(-1)
    if (ref) {
      schemas.push(parseObject(apiSpec?.components?.schemas?.[ref] ?? {}, [ref]))
    }
  }

  if (schemas.length > 1) {
    return <Tabs>
      {schemas.map((s, key) => {
        return <Tab key={`Schema-${key}`} eventKey={`Schema-${key}`} title={`Schema ${key}`}>
          <Markdown>{`${markdownCode}json\n${JSON.stringify(s, null, 3)}\n${markdownCode}`}</Markdown>
        </Tab>
      })}
    </Tabs>
  } else {
    return <Markdown>{`${markdownCode}json\n${JSON.stringify(schemas[0], null, 3)}\n${markdownCode}`}</Markdown>
  }

}

function getPropertyValue(property: OpenAPIV3_1.SchemaObject, ref: string[] = []): string | object | object[] | OpenAPIV3_1.NonArraySchemaObject {
  const apiSpec = useAppSelector(state => state.apiDoc.spec)
  if (property && "properties" in property && property.properties) {
    return parseObject(property)
  } else if ("anyOf" in property && property.anyOf) {
    const anyRet = property.anyOf.map((anyOf: OpenAPIV3_1.SchemaObject) => {
      if (anyOf["type"] == "array") {
        return getPropertyValue(anyOf, ref)
      } else {
        return anyOf["type"]
      }
    })
    if (anyRet.every((x) => typeof x === "string")) {
      return anyRet.join("|");
    } else if (anyRet.includes("null")) {
      let returnItem = {}
      anyRet.forEach(item => {
        if (item !== "null") {
          if (item !== undefined) {
            returnItem = item;
          }
        }
      });
      return returnItem;
    }

  } else if (property["type"] == "array") {
    if ("items" in property) {
      return [getPropertyValue(property["items"], ref)]
    }
  } else if (property && "$ref" in property && property.$ref) {
    const locRef = (property.$ref as string).split("/").at(-1)
    if (locRef && !locRef.startsWith("api__models") && !ref.includes(locRef)) {
      ref.push(locRef)
      return parseObject(apiSpec?.components?.schemas?.[locRef], ref)
    } else {
      return locRef?.replace("api__models__public__", "#/public/").replace("api__models__base__", "#/base/").replace("api__models__db__", "#/db/") ?? "unknown"
    }
  }
  return property["type"] ?? "unknown"
}