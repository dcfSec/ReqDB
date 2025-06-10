import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';

import store from './store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router';

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
        {/* <AuthProvider {...oidcConfig}> */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {/* </AuthProvider> */}
      </Provider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
