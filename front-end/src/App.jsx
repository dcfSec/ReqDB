import './App.css';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

import { Router, LoginRouter } from './components/Router';

import { useSelector, useDispatch } from 'react-redux'
import { setAccount, setRoles, setName } from "./stateSlices/UserSlice";

import { useEffect } from "react";


const MainContent = () => {

  const dispatch = useDispatch()

  const darkMode = useSelector(state => state.user.preferences.darkMode)
  document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", darkMode ? "dark" : "light");

  /**
   * useMsal is a hook that returns the PublicClientApplication instance.
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
   */
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  if (!activeAccount) {
    instance.setActiveAccount(instance);
    // instance.loginRedirect({
    //   ...loginRequest,
    //   prompt: 'login',
    // });
  }

  useEffect(() => {
    if (activeAccount) {
      dispatch(setAccount(activeAccount));
      if (activeAccount.idTokenClaims['roles']) {
        dispatch(setRoles(activeAccount.idTokenClaims['roles']));
      }
      if (activeAccount.username) {
        dispatch(setName(activeAccount.username));
      }
    }
  }, [activeAccount]);



  /**
   * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
   * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
   * only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
   */
  return (<>
    <AuthenticatedTemplate>
      {activeAccount ? (
        <Router />
      ) : null}
    </AuthenticatedTemplate>
    <UnauthenticatedTemplate>
      <LoginRouter />
    </UnauthenticatedTemplate>
  </>
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
