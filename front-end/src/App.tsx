import { useEffect, useState } from 'react';
import './App.css';
import { Router, LoginRouter } from './components/Router';
import { useAppDispatch } from './hooks';
import { setRoles, setName, syncLocalStorage } from "./stateSlices/UserSlice";
import store from './store';
import { useAuth } from 'react-oidc-context';
import { showSpinner } from './stateSlices/MainLogoSpinnerSlice';


function App() {
  const auth = useAuth();
  const dispatch = useAppDispatch()

  const [hasTriedSilentSignin, setHasTriedSilentSignin] = useState(false);


  useEffect(() => {
    return auth.events.addAccessTokenExpiring(() => {
      auth.signinSilent();
    })
  }, [auth.events, auth.signinSilent]);

  useEffect(() => {
    if (auth.user?.expired && !hasTriedSilentSignin) {
      auth.signinSilent();
      setHasTriedSilentSignin(true);
    }
  }, [auth, hasTriedSilentSignin]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  // if (auth.error) {
  //   store.dispatch(showSpinner(false))
  //   store.dispatch(toast({ header: "Authentication error", body: `Message:${auth.error.message}`}))
  // }

  console.log(auth)

  if (auth.isAuthenticated) {
    store.dispatch(showSpinner(false))
    dispatch(setRoles(auth.user?.profile.roles as string[]));
    dispatch(setName(auth.user?.profile.email as string));
    return <Router />
  }
  return <LoginRouter authError={auth.error ? auth.error.message : null}/>;
}

export default App;

window.addEventListener('storage', function (event) {
  if (event.key === "darkMode") {
    const dispatch = store.dispatch;
    const darkMode = store.getState().user.preferences.darkMode
    dispatch(syncLocalStorage(JSON.parse(localStorage.getItem('darkMode') || String(darkMode))))
  }
});