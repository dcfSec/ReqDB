import './App.css';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

import { UserContext } from "./static";
import { useEffect, useState } from 'react';

import { Router, LoginRouter } from './components/Router';

const MainContent = () => {

  const [notificationToastHandler, setNotificationToastHandler] = useState(["", "", false])
  const [showSpinner, setShowSpinner] = useState(false)
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode')) || false)

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  /**
   * useMsal is a hook that returns the PublicClientApplication instance.
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
   */
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  if (!activeAccount) {
    instance.setActiveAccount(instance);
    instance.loginRedirect({
        ...loginRequest,
        prompt: 'login',
    });
  }

  /**
   * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
   * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
   * only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
   */
  return (
    <UserContext.Provider value={{ notificationToastHandler, setNotificationToastHandler, showSpinner, setShowSpinner }}>
      <AuthenticatedTemplate>
        {activeAccount ? (
          <Router showSpinner={showSpinner} setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler} darkMode={darkMode} setDarkMode={setDarkMode} />
        ) : null}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginRouter showSpinner={showSpinner} setShowSpinner={setShowSpinner} notificationToastHandler={notificationToastHandler} setNotificationToastHandler={setNotificationToastHandler} darkMode={darkMode} setDarkMode={setDarkMode} />
      </UnauthenticatedTemplate>
    </UserContext.Provider>
  );
};

function App({ instance }) {

  return (
    <MsalProvider instance={instance}>
      <MainContent />
    </MsalProvider>
  );
}

export default App;
