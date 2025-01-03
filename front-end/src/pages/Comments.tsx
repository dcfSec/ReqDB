import { Alert, Col, Row } from "react-bootstrap";
import { SearchField } from '../components/MiniComponents';
import { ErrorMessage } from '../components/MiniComponents'
import DataTable from '../components/DataTable';
import Form from 'react-bootstrap/Form';
import LoadingBar from "../components/LoadingBar";


import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { showSpinner } from "../stateSlices/MainLogoSpinnerSlice";
import { reset, setComments } from "../stateSlices/CommentSlice";
import { CommentRow } from "../components/Comments/CommentRow";
import { setBreadcrumbs, setPageTitle } from "../stateSlices/LayoutSlice";


/**
 * Container for the main view when logged in
 * 
 * @returns Container for the home view
 */
export default function Comments() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBreadcrumbs([{ href: "", title: "Comments", active: true }]))
    dispatch(setPageTitle("Comments"))
    }, []);

  const comments = useAppSelector(state => state.comment.comments)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const searchFields = ["comment", "requirement.title"]
  const headers = [
    "#",
    "Comment",
    "Author",
    "Completed",
    "Requirement",
    "Action"
  ]

  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

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

  let searchBar = <LoadingBar/>
  let table = <></>
  let body = <></>

  if (error) {
    body = <Row><Col><Alert variant="danger">Error loading catalogue data. Error: {error.message}</Alert></Col></Row>
  } else if (APIError) {
    body = <Row><Col><Alert variant="danger">{ErrorMessage(APIError)}</Alert></Col></Row>
  } else if (fetched) {
    searchBar = <Col><SearchField title="Comments" search={search} onSearch={setSearch}></SearchField></Col>
    table = <Row><Col><DataTable headers={headers}>
      { comments.length > 0 ? comments.map((item, index) => (
        <CommentRow key={index} index={index} search={search} searchFields={searchFields} comment={item} showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} showCompleted={showCompleted}/>
      )) : <tr><td colSpan={6} style={{textAlign: 'center'}}>No comments</td></tr> }
    </DataTable></Col></Row>
    body = (
      <>
        <Row>{searchBar}</Row>
        <Row>
          <Col><Form.Check type="switch" id="completed" defaultChecked={showCompleted} onChange={e => { setShowCompleted(e.target.checked) }} label="Show completed" reverse/></Col>
        </Row>
        {table}
      </>
    )
  }

  return (
    <>
      <Row>
        <Col><h2>Comments</h2></Col>
      </Row>
      {body}
    </>
  )
};
