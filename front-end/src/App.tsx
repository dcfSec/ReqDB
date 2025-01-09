import './App.css';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Router, LoginRouter } from './components/Router';
import { useAppDispatch } from './hooks';
import { setRoles, setName, syncLocalStorage } from "./stateSlices/UserSlice";

import {
  IPublicClientApplication,
} from "@azure/msal-browser";
import store from './store';

function MainContent() {

  const dispatch = useAppDispatch()

  const { instance } = useMsal();
  const account = instance.getActiveAccount();
  if (account) {
    if (account.idTokenClaims && account.idTokenClaims['roles']) {
      dispatch(setRoles(account.idTokenClaims['roles']));
    }
    if (account.username) {
      dispatch(setName(account.username));
    }
  }

  return (<>
    <AuthenticatedTemplate>
      {account ? (
        <Router />
      ) : null}
    </AuthenticatedTemplate>
    <UnauthenticatedTemplate>
      <LoginRouter />
    </UnauthenticatedTemplate>
  </>
  );
};

type Props = {
  instance: IPublicClientApplication;
}

function App({ instance }: Props) {
  return (
    <MsalProvider instance={instance}>
      <MainContent />
    </MsalProvider>
  );
}

export default App;

window.addEventListener('storage', function (event) {
  if (event.key === "darkMode") {
    const dispatch = store.dispatch;
    const darkMode = store.getState().user.preferences.darkMode
    dispatch(syncLocalStorage(JSON.parse(localStorage.getItem('darkMode') || String(darkMode))))
  }
});