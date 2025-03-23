import { useEffect, useState } from 'react';
import './App.css';
import { Router, LoginRouter } from './components/Router';
import { useAppDispatch } from './hooks';
import { setRoles, setName, syncLocalStorage } from "./stateSlices/UserSlice";
import store from './store';
import { useAuth } from 'react-oidc-context';
import { showSpinner } from './stateSlices/MainLogoSpinnerSlice';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSun, faMoon, faDatabase, faLink, faComment, faPaperPlane, faEraser, faPen, faCheck, faArrowsRotate, faArrowRight, faCodeCompare, faReply, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faCircleQuestion, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';


library.add(faGithub, faSun, faMoon, faDatabase, faEyeSlash, faEye, faLink, faComment, faPaperPlane, faEraser, faPen, faCheck, faArrowsRotate, faArrowRight, faCircleQuestion, faCodeCompare, faReply, faXmark)

function App() {
  const auth = useAuth();
  const dispatch = useAppDispatch()

  const [hasTriedSignin, setHasTriedSignin] = useState(false);



  useEffect(() => {
    return auth.events.addAccessTokenExpiring(async () => {
      await auth.signinSilent()
      if (!auth.user || auth.user.expired) {
        auth.signinRedirect()
      }

    })
  }, [auth.events, auth.signinSilent]);

  useEffect(() => {
    if (auth.user?.expired && !hasTriedSignin) {
      auth.signinSilent().then(() => {
        if (!auth.user || auth.user.expired) {
          auth.signinRedirect()
        }
      });
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isAuthenticated) {
    store.dispatch(showSpinner(false))
    dispatch(setRoles(auth.user?.profile.roles as string[]));
    dispatch(setName(auth.user?.profile.email as string));
    return <Router />
  }
  return <LoginRouter authError={auth.error ? auth.error.message : null} />;
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