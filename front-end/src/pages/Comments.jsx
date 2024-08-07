import { Button, Col, Container, ProgressBar, Row } from "react-bootstrap";
import { MainBreadcrumb, SearchField } from '../components/MiniComponents';
import { appRoles } from "../authConfig";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { ErrorMessage } from '../components/MiniComponents'
import EditTable from '../components/Edit/EditTable';


import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setComments } from "../stateSlices/CommentSlice";
import { CommentRow } from "../components/Comments/CommentRow";


/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function Comments() {
  const dispatch = useDispatch()

  const comments = useSelector(state => state.comment.comments)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);

  const title = "Comments"
  const breadcrumbs = [
    { href: "", title: title, active: true }
  ]
  document.title = `${title} | ReqDB - Requirement Database`;

  const searchFields = ["comment", "requirement.title"]
  const headers = [
    "#",
    "Comment",
    "Author",
    "Requirement",
    "Action"
  ]


  const [search, setSearch] = useState("");

  const roles = useSelector(state => state.user.roles)

  const { error, execute } = useFetchWithMsal({
    scopes: protectedResources.ReqDB.scopes,
  });

  const [fetched, setFetched] = useState(false);
  const [APIError, setAPIError] = useState(null);

  useEffect(() => { dispatch(showSpinner(!fetched)) }, [fetched]);

  useEffect(() => {
    dispatch(reset());
    execute("GET", `comments`).then((response) => {
      if (response && response.status === 200) {
        dispatch(setComments(response.data))
        setFetched(true);
      } else if (response && response.status !== 200) {
        setAPIError(response.message)
        setFetched(true);
      }
    });
  }, [execute])

  let searchBar = <ProgressBar animated now={100} />
  let table = <></>

  if (error) {
    body = <Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert>
  } else if (APIError) {
    body = <Alert variant="danger">{ErrorMessage(APIError)}</Alert>
  } else if (fetched) {
    searchBar = <Col><SearchField title={title} search={search} onSearch={setSearch}></SearchField></Col>
    table = <EditTable headers={headers}>
      { comments.length > 0 ? comments.map((item, index) => (
        <CommentRow key={index} index={index} search={search} searchFields={searchFields} comment={item} showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} setForce={setForce} />
      )) : <tr><td colSpan={5} style={{textAlign: 'center'}}>No comments</td></tr> }
    </EditTable>
  }

  return (
    <Container fluid className="bg-body">
      <Row>
        <Col><MainBreadcrumb items={breadcrumbs}></MainBreadcrumb></Col>
      </Row>
      <Row>
        <Col><h2>{title}</h2></Col>
      </Row>
      <Row>
        {searchBar}
      </Row>
      <Row>
        {table}
      </Row>
    </Container>
  )
};
