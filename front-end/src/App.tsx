import './App.css';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';

import { Router, LoginRouter } from './components/Router';
import { useAppDispatch, useAppSelector } from './hooks';
import { setRoles, setName } from "./stateSlices/UserSlice";

import {
  IPublicClientApplication,
} from "@azure/msal-browser";

const MainContent = () => {
    const dispatch = useAppDispatch()

  const darkMode = useAppSelector(state => state.user.preferences.darkMode)
  document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", darkMode ? "dark" : "light");
  
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
