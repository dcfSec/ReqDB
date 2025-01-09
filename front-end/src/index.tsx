import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';

import { msalConfig, protectedResources } from "./authConfig.js";

import store from './store'
import { Provider } from 'react-redux'
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import APIClient from './APIClient';

const msalInstance = new PublicClientApplication(msalConfig);
msalInstance.initialize().then(() => {

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }
  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance.setActiveAccount(account);
    }
  });
  APIClient.interceptors.request.use(async (config) => {
    const account = msalInstance.getActiveAccount();
    if (account) {
      try {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          account: account,
          scopes: protectedResources.ReqDB.scopes,
        });
        config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // fallback to interaction when silent call fails
          msalInstance.acquireTokenRedirect({
            account: account,
            scopes: protectedResources.ReqDB.scopes,
          });
        } else {
          throw error;
        }
      }
    }
    return config;
  });
});

const darkMode = JSON.parse(localStorage.getItem('darkMode') || "false") || false
document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", darkMode ? "dark" : "light");
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App instance={msalInstance} />
      </Provider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
