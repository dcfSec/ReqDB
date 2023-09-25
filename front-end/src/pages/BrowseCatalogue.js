import { Alert, Button, Col, Container, Dropdown, ProgressBar, Row, Stack } from "react-bootstrap";
import { MainBreadcrumb, SearchField } from "../components/MiniComponents";
import { useContext, useEffect, useState } from "react";
import { API, UserContext, handleErrorMessage } from "../static";
import DataTable from "../components/DataTable";
import BrowseRow from "../components/Browse/BrowseRow";
import { CheckboxDropdown } from "../components/CheckboxDropdown";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import FilterTopicModal from "../components/Browse/FilterTopicsModal";
import { protectedResources } from "../authConfig";
import useFetchWithMsal from "../hooks/useFetchWithMsal";

export default function BrowseCatalogue() {

  const title = "Browse"
  const breadcrumbs = [
      { href: "", title: title, active: true }
  ]
  const [search, setSearch] = useState("");

  const headers = [
    "Tags",
    "Topics",
    "Key",
    "Title",
    "Description"
  ]

  const params = useParams();
  const id = params.catalogueId

  const { setShowSpinner } = useContext(UserContext)

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  const [catalogueData, setCatalogueData] = useState(null);

  useEffect(() => { setShowSpinner(!catalogueData) }, [catalogueData]);

  useEffect(() => {
      if (!catalogueData) {
          execute("GET", `${API}/catalogues/${id}`).then((response) => {
            setCatalogueData(response);
          });
      }
  }, [execute, catalogueData])

  let rows = []
  let extraHeaders = []
  let extraHeaderTypes = {}
  let isBuilt = false
  let rootTopics = []

  let tagFilterItems = []
  let topicFilterItems = []

  let [tagFiltered, setTagFiltered] = useState(null);
  let [topicFiltered, setTopicFiltered] = useState(null);
  let [markRowChecked, setMarkRowChecked] = useState([]);
  let [allMarkRowChecked, setAllMarkRowChecked] = useState(false);
  let [showFilterModal, setShowFilterModal] = useState(false);

  let body = <ProgressBar animated now={100} />

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert>
  } else {
    if (catalogueData && catalogueData.status === 200) {
      if (!isBuilt) {
        rootTopics = catalogueData.data.topics
        getItemEntry( { children: rootTopics }, [], Number(catalogueData.data.maxDepth))
        rows.sort((a, b) => {
          const nameA = a.Key.toUpperCase(); 
          const nameB = b.Key.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        isBuilt = true
        body = <DataTable headers={[...headers, ...extraHeaders]} markAll={true} markAllCallback={handleCheckboxChangeAll} markAllChecked={allMarkRowChecked}>{rows.map((row, index) => ( <BrowseRow key={index} index={index} extraHeaders={extraHeaders} row={row} search={search} tags={tagFilterItems} topicFiltered={topicFiltered} tagFiltered={tagFiltered} extraHeaderTypes={extraHeaderTypes} markRowCallback={handleSelectCheckboxChange} markRowChecked={markRowChecked}></BrowseRow>))}</DataTable>
      }
    } else if (catalogueData && catalogueData.status !== 200) {
      body = <Alert variant="danger">{handleErrorMessage(catalogueData.message)}</Alert>
    }
  }

  function getItemEntry(item, topics, depth) {
    if ('requirements' in item) {
      item.requirements.forEach(requirement => {
        const tags = []
        requirement.tags.forEach(tag => {
            tags.push(tag.name)
            if (!tagFilterItems.includes(tag.name)) {
              tagFilterItems.push(tag.name)
            }
        });
        const base = {
            Tags: tags,
            Topics: [...topics],
            Key: requirement.key,
            Title: requirement.title,
            Description: requirement.description,
          }
          const extraColumns = {}
          requirement.extras.forEach(extra => {
            extraColumns[extra.extraType.title] = extra.content
            if (!extraHeaders.includes(extra.extraType.title)) {
              extraHeaders.push(extra.extraType.title)
              extraHeaderTypes[extra.extraType.title] = extra.extraType.extraType
            }
          });
        rows.push({...base, ...extraColumns})
      });
    }
    if ('children' in item) {
      item.children.forEach(topic => {
        if (!topicFilterItems.includes(`${topic.key} ${topic.title}`)) {
          topicFilterItems.push(`${topic.key} ${topic.title}`)
        }
        getItemEntry(topic, [...topics, topic], depth-1)
      });
    }
  }


  useEffect(() => { arrayIsEqualLength(markRowChecked, rows) ?  setAllMarkRowChecked(true) : setAllMarkRowChecked(false) }, [rows, markRowChecked]);

  function handleSelectCheckboxChange(changeEvent) {
    const { id } = changeEvent.target;

    if (!markRowChecked.includes(Number(id))) {
      setMarkRowChecked([ ...markRowChecked, ...[Number(id)] ])
    } else {
      const tempItem = markRowChecked.filter(function(v){ return v !== Number(id); });
      setMarkRowChecked([ ...tempItem ]);
      
    }
  };

  function arrayIsEqualLength (a1, a2) {
    return a1.length === a2.length
  }

  function handleCheckboxChangeAll(changeEvent) {
    const { checked } = changeEvent.target;

    if (checked === true) {
      setMarkRowChecked([ ...Array(rows.length).keys() ])
    } else {
      setMarkRowChecked([ ]);
    }
  };

  function exportExcel() {

    let exportData = rows.filter(function(v, index){ return markRowChecked.includes(index); });
    exportData = exportData.map((row) => ({ ...row, ...{Tags: row.Tags.join("\r\n"), Topics: row.Topics.map((topic) => (topic.title)).join("\r\n")}}));

    const headerRow = `A1:${String.fromCharCode(64 + [...headers, ...extraHeaders].length)}1`

    var sheet = XLSX.utils.json_to_sheet(exportData, {headers:[...headers, ...extraHeaders]});
    sheet['!autofilter']={ref:headerRow};

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Export");
    XLSX.writeFile(workbook, "ReqDB-Export.xlsx");
  }

  if (catalogueData && catalogueData.status === 200) {
    if (topicFiltered == null && tagFiltered == null) {
      setTopicFiltered(topicFilterItems); setTagFiltered(tagFilterItems)
    }

    return (
      <Container fluid className="bg-body">
        <Row>
          <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
        </Row>
        <Row>
          <Col><h2>Browse <code>{catalogueData.data.title}</code></h2></Col>
        </Row>
        <Row>
          <Col><SearchField title="Requirements" search={search} onSearch={setSearch}></SearchField></Col>
        </Row>
        <Row>
          <Col>
            <Dropdown className="d-inline">
              <Dropdown.Toggle id="tag-dropdown">Filter Tags</Dropdown.Toggle>
              <Dropdown.Menu as={CheckboxDropdown} filteredItem={tagFiltered} setFilteredItem={setTagFiltered} filterItems={tagFilterItems}>
                {tagFilterItems.sort().map((tag, index) => ( <Dropdown.Item key={index} eventKey={tag}>{tag}</Dropdown.Item> ))}
              </Dropdown.Menu>
            </Dropdown>
            <Button className="mx-1" onClick={() => {setShowFilterModal(true)}}>Filter topic</Button>
          </Col>
          <Col md={2}>
            <Stack direction="horizontal" gap={3}>
              <div className="p-2 ms-auto"><Button variant="primary" onClick={exportExcel}>Export Selected</Button></div>
            </Stack></Col>
        </Row>
        <Row>
        <Col>
          {body}
        </Col>
        </Row>
        <FilterTopicModal show={showFilterModal} setShow={setShowFilterModal} topics={rootTopics} filteredTopics={topicFiltered} setFilteredTopics={setTopicFiltered} />
      </Container>
    );
  } else {
    return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>Browse</h2></Col>
      </Row>
      <Row>
      <Col>
        {body}
      </Col>
      </Row>
    </Container>
    )
  }
}