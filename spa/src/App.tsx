import './App.css';
import { Router, LoginRouter } from './components/Router';
import { useAppDispatch, useAppSelector } from './hooks';
import { syncLocalStorage, setAuthenticated } from "./stateSlices/UserSlice";
import store from './store';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSun, faMoon, faDatabase, faLink, faComment, faPaperPlane, faEraser, faPen, faCheck, faArrowsRotate, faArrowRight, faCodeCompare, faReply, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faCircleQuestion, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { useSearchParams } from 'react-router';
import { useEffect } from 'react';


library.add(faGithub, faSun, faMoon, faDatabase, faEyeSlash, faEye, faLink, faComment, faPaperPlane, faEraser, faPen, faCheck, faArrowsRotate, faArrowRight, faCircleQuestion, faCodeCompare, faReply, faXmark, faPlus)

function App() {
  const dispatch = useAppDispatch()

  const authenticated = useAppSelector(state => state.user.authenticated)
  const token = useAppSelector(state => state.user.token)
  const [searchParams, setSearchParams] = useSearchParams();
  const login = searchParams.get("login")

  useEffect(() => {
    if (login == "") {
      if (token !== "") {
        dispatch(setAuthenticated(true))
        searchParams.delete("login")
        setSearchParams(searchParams);
      }
    }
  }, [login]);

  if (authenticated) {
    // store.dispatch(showSpinner(false))
    return <Router />
  }
  const authError = searchParams.get("error")
  const authErrorMessage = searchParams.get("authErrorMessage")

  return <LoginRouter authError={authError} authErrorMessage={authErrorMessage} />;
}

export default App;

window.addEventListener('storage', function (event) {
  if (event.key === "darkMode") {
    const dispatch = store.dispatch;
    const darkMode = store.getState().user.preferences.darkMode
    dispatch(syncLocalStorage(JSON.parse(localStorage.getItem('darkMode') || String(darkMode))))
  }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  const dispatch = store.dispatch;
  dispatch(syncLocalStorage(event.matches));
});