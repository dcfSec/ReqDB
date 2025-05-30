import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';

import { oidcConfig } from "./authConfig.js";

import store from './store'
import { Provider } from 'react-redux'

import { staticConfig } from "./static";
import { User } from 'oidc-client-ts';
import { AuthProvider, useAuth } from "react-oidc-context";

import APIClient from './APIClient';
import { BrowserRouter } from 'react-router';

function getUser() {
  const oidcStorage = localStorage.getItem(`oidc.user:${staticConfig.oauth.authority}:${staticConfig.oauth.client_id}`)
  if (!oidcStorage) {
    return null;
  }
  return User.fromStorageString(oidcStorage);
}

APIClient.interceptors.request.use(async (config) => {
  const user = getUser();
  const token = user?.access_token;
  if (user && user.expired) {
    await useAuth().signinSilent()
  }
  if (token != undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let darkMode = false
if (localStorage.getItem('darkMode') == undefined) {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    darkMode = true
  }
} else {
  darkMode = JSON.parse(localStorage.getItem('darkMode') || "false") || false
}

document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", darkMode ? "dark" : "light");
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <AuthProvider {...oidcConfig}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
