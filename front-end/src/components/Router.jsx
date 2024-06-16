import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from '../pages/Layout';
import Home from '../pages/Home';
import BrowseCatalogue from '../pages/BrowseCatalogue';
import BrowseSelectCatalogue from '../pages/BrowseSelectCatalogue';
import { Catalogues, ExtraEntries, ExtraTypes, Requirements, Tags, Topics } from '../pages/Edit';
import NoPage from '../pages/NoPage';
import RouteGuard from "./RouteGuard";
import { appRoles } from "../authConfig";
import Login from "../pages/Login";
import Requirement from "../pages/Requirement";

/**
 * Main Router for the web app
 * 
 * @param {object} props Props for the component: darkMode, setDarkMode
 * @returns Returns the router for the app
 */
export function Router({ darkMode, setDarkMode }) {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RouteGuard roles={[appRoles.Reader, appRoles.Writer]} title="Home"><Layout darkMode={darkMode} setDarkMode={setDarkMode} /></RouteGuard>}>
          <Route index element={<RouteGuard roles={[appRoles.Reader, appRoles.Writer]} title="Home"><Home /></RouteGuard>} />
          <Route path="Browse" element={<RouteGuard roles={[appRoles.Reader, appRoles.Writer]} title="Browse"><BrowseSelectCatalogue /></RouteGuard>} />
          <Route path="Browse/:catalogueId" element={<RouteGuard roles={[appRoles.Reader, appRoles.Writer]} title="Browse"><BrowseCatalogue /></RouteGuard>} />
          <Route path="Browse/Requirement/:requirementId" element={<RouteGuard roles={[appRoles.Reader, appRoles.Writer]} title="Requirement"><Requirement /></RouteGuard>} />
          <Route path="Edit" >
            <Route path="Tags" element={
              <RouteGuard roles={[appRoles.Writer]} title="Tags"><Tags /></RouteGuard>
            } />
            <Route path="Catalogues" element={
              <RouteGuard roles={[appRoles.Writer]} title="Catalogues"><Catalogues /></RouteGuard>
            } />
            <Route path="Topics" element={
              <RouteGuard roles={[appRoles.Writer]} title="Topics"><Topics /></RouteGuard>
            } />
            <Route path="Requirements" element={
              <RouteGuard roles={[appRoles.Writer]} title="Requirements"><Requirements /></RouteGuard>
            } />
            <Route path="ExtraTypes" element={
              <RouteGuard roles={[appRoles.Writer]} title="ExtraTypes"><ExtraTypes /></RouteGuard>
            } />
            <Route path="ExtraEntries" element={
              <RouteGuard roles={[appRoles.Writer]} title="ExtraEntries"><ExtraEntries /></RouteGuard>
            } />
          </Route>
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

/**
 * Router for a non-logged in user
 * 
 * @param {object} props Props for the component: darkMode, setDarkMode
 * @returns Returns the login router
 */
export function LoginRouter({ darkMode, setDarkMode }) {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout darkMode={darkMode} setDarkMode={setDarkMode} />}>
          <Route index element={<Login />} />
          <Route path="*" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
