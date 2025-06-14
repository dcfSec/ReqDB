import { Routes, Route } from "react-router";

import Layout from '../pages/Layout';
import Home from '../pages/Home';
import BrowseCatalogue from '../pages/BrowseCatalogue';
import BrowseSelectCatalogue from '../pages/BrowseSelectCatalogue';
import { Catalogues, ExtraEntries, ExtraTypes, Requirements, Tags, Topics } from '../pages/Edit';
import { AuditCatalogues, AuditExtraEntries, AuditExtraTypes, AuditRequirements, AuditTags, AuditTopics, AuditComments } from '../pages/Audit';
import NoPage from '../pages/NoPage';
import RouteGuard from "./RouteGuard";
import { appRoles } from "../authConfig";
import Login from "../pages/Login";
import Requirement from "../pages/Requirement";
import Comments from "../pages/Comments";
import APIDoc from "../pages/APIDoc";
import LoginCallback from "./LoginCallback";

/**
 * Main Router for the web app
 * 
 * @returns Returns the router for the app
 */
export function Router() {

  return (
    <Routes>
      <Route path="/" element={/*<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} title="Home">*/<Layout />/*</RouteGuard>*/}>
        <Route index element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} /* title="Home" */><Home /></RouteGuard>} />
        <Route path="oauth">
          <Route path="callback" element={<LoginCallback />} />
        </Route>
        <Route path="Browse" element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} /* title="Browse" */><BrowseSelectCatalogue /></RouteGuard>} />
        <Route path="Browse/:catalogueId" element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} /* title="Browse" */><BrowseCatalogue /></RouteGuard>} />
        <Route path="Browse/Requirement/:requirementId" element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} /* title="Requirement" */><Requirement /></RouteGuard>} />
        <Route path="Comments" element={<RouteGuard requiredRoles={[appRoles.Comments.Reader]} /* title="Comments" */><Comments /></RouteGuard>} />
        <Route path="Edit" >
          <Route path="Tags" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Writer]}/*  title="Tags" */><Tags /></RouteGuard>
          } />
          <Route path="Catalogues" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Writer]} /* title="Catalogues" */><Catalogues /></RouteGuard>
          } />
          <Route path="Topics" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Writer]} /* title="Topics" */><Topics /></RouteGuard>
          } />
          <Route path="Requirements" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Writer]} /* title="Requirements" */><Requirements /></RouteGuard>
          } />
          <Route path="ExtraTypes" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Writer]} /* title="ExtraTypes" */><ExtraTypes /></RouteGuard>
          } />
          <Route path="ExtraEntries" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Writer]} /* title="ExtraEntries" */><ExtraEntries /></RouteGuard>
          } />
        </Route>
        <Route path="Audit" >
          <Route path="Tags" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Auditor]} /* title="Tags" */><AuditTags /></RouteGuard>
          } />
          <Route path="Catalogues" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Auditor]} /* title="Catalogues" */><AuditCatalogues /></RouteGuard>
          } />
          <Route path="Topics" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Auditor]} /* title="Topics" */><AuditTopics /></RouteGuard>
          } />
          <Route path="Requirements" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Auditor]} /* title="Requirements" */><AuditRequirements /></RouteGuard>
          } />
          <Route path="ExtraTypes" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Auditor]} /* title="ExtraTypes" */><AuditExtraTypes /></RouteGuard>
          } />
          <Route path="ExtraEntries" element={
            <RouteGuard requiredRoles={[appRoles.Requirements.Auditor]} /* title="ExtraEntries" */><AuditExtraEntries /></RouteGuard>
          } />
          <Route path="Comments" element={
            <RouteGuard requiredRoles={[appRoles.Comments.Auditor]} /* title="Comments" */><AuditComments /></RouteGuard>
          } />
        </Route>
        <Route path="APIDoc" element={<RouteGuard requiredRoles={[appRoles.Comments.Reader]}><APIDoc /></RouteGuard>} />
        <Route path="*" element={<NoPage />} />
      </Route>
    </Routes>
  )
}

/**
 * Router for a non-logged in user
 * 
 * @returns Returns the login router
 */
export function LoginRouter({ authError = null, authErrorMessage = null }: { authError?: string | null; authErrorMessage?: string | null; }) {

  return (
    <Routes>
      <Route path="/oauth">
        <Route path="callback" element={<LoginCallback />} />
      </Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login authError={authError} authErrorMessage={authErrorMessage} />} />
        <Route path="*" element={<Login authError={authError} />} />
      </Route>
    </Routes>
  )
}
