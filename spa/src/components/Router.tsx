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
import { ServiceUser, System } from "../pages/Administration";

/**
 * Main Router for the web app
 * 
 * @returns Returns the router for the app
 */
export function Router() {

  return (
    <Routes>
      <Route path="/" element={/*<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} title="Home">*/<Layout />/*</RouteGuard>*/}>
        <Route index element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]} ><Home /></RouteGuard>} />
        <Route path="oauth">
          <Route path="callback" element={<LoginCallback />} />
        </Route>
        <Route path="Browse" element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]}><BrowseSelectCatalogue /></RouteGuard>} />
        <Route path="Browse/:catalogueId" element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]}><BrowseCatalogue /></RouteGuard>} />
        <Route path="Browse/Requirement/:requirementId" element={<RouteGuard requiredRoles={[appRoles.Requirements.Reader]}><Requirement /></RouteGuard>} />
        <Route path="Comments" element={<RouteGuard requiredRoles={[appRoles.Comments.Reader]}><Comments /></RouteGuard>} />
        <Route path="Edit" >
          <Route path="Tags" element={<RouteGuard requiredRoles={[appRoles.Requirements.Writer]}><Tags /></RouteGuard>} />
          <Route path="Catalogues" element={<RouteGuard requiredRoles={[appRoles.Requirements.Writer]} ><Catalogues /></RouteGuard>} />
          <Route path="Topics" element={<RouteGuard requiredRoles={[appRoles.Requirements.Writer]} ><Topics /></RouteGuard>} />
          <Route path="Requirements" element={<RouteGuard requiredRoles={[appRoles.Requirements.Writer]} ><Requirements /></RouteGuard>} />
          <Route path="ExtraTypes" element={<RouteGuard requiredRoles={[appRoles.Requirements.Writer]} ><ExtraTypes /></RouteGuard>} />
          <Route path="ExtraEntries" element={<RouteGuard requiredRoles={[appRoles.Requirements.Writer]} ><ExtraEntries /></RouteGuard>} />
        </Route>
        <Route path="Audit" >
          <Route path="Tags" element={<RouteGuard requiredRoles={[appRoles.Requirements.Auditor]}><AuditTags /></RouteGuard>} />
          <Route path="Catalogues" element={<RouteGuard requiredRoles={[appRoles.Requirements.Auditor]}><AuditCatalogues /></RouteGuard>} />
          <Route path="Topics" element={<RouteGuard requiredRoles={[appRoles.Requirements.Auditor]}><AuditTopics /></RouteGuard>} />
          <Route path="Requirements" element={<RouteGuard requiredRoles={[appRoles.Requirements.Auditor]}><AuditRequirements /></RouteGuard>} />
          <Route path="ExtraTypes" element={<RouteGuard requiredRoles={[appRoles.Requirements.Auditor]}><AuditExtraTypes /></RouteGuard>} />
          <Route path="ExtraEntries" element={<RouteGuard requiredRoles={[appRoles.Requirements.Auditor]}><AuditExtraEntries /></RouteGuard>} />
          <Route path="Comments" element={<RouteGuard requiredRoles={[appRoles.Comments.Auditor]}><AuditComments /></RouteGuard>} />
        </Route>
        <Route path="Administration">
          <Route path="System" element={<RouteGuard requiredRoles={[appRoles.Configuration.Writer]}><System /></RouteGuard>} />
          <Route path="ServiceUser" element={<RouteGuard requiredRoles={[appRoles.ServiceUser.Writer, appRoles.ServiceUser.Reader]}><ServiceUser /></RouteGuard>} />
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
