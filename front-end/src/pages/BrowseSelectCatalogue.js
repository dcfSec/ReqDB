import { Alert, Col, Container, ListGroup, ProgressBar, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb } from "../components/MiniComponents";
import { useContext, useEffect, useState } from "react";
import { API, UserContext, handleErrorMessage } from "../static";
import SelecttCatalogueItem from "../components/Browse/SelectCatalogueItem";

import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';

export default function BrowseSelectCatalogue() {

  const title = "Browse"
  const breadcrumbs = [
      { href: "", title: title, active: true }
  ]

  const { setShowSpinner } = useContext(UserContext)

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  const [catalogueData, setCatalogueData] = useState(null);

  useEffect(() => { setShowSpinner(!catalogueData) }, [catalogueData]);

  useEffect(() => {
      if (!catalogueData) {
          execute("GET", `${API}/catalogues?minimal`).then((response) => {
            setCatalogueData(response);
          });
      }
  }, [execute, catalogueData])


  let body = <ProgressBar animated now={100} />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data</Alert>
  } else {
    if (catalogueData && catalogueData.status === 200) {
      body = <Stack gap={2} className="col-md-5 mx-auto"><ListGroup>
        {catalogueData.data.sort((a, b) => {
        const nameA = a.title.toUpperCase();
        const nameB = b.title.toUpperCase();
        if (nameA > nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }).map((catalogue, index) => ( <SelecttCatalogueItem key={index} catalogue={catalogue}/>))}
        </ListGroup></Stack>
    } else if (catalogueData && catalogueData.status !== 200) {
      body = <Alert variant="danger">{handleErrorMessage(catalogueData.data.message)}</Alert>
    }
  }

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>Select Catalogue</h2></Col>
      </Row>
      <Row>
      <Col>
        {body}
      </Col>
      </Row>
    </Container>
  );
}