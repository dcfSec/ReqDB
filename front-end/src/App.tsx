import './App.css';
import { Router, LoginRouter, LoginErrorRouter } from './components/Router';
import { useAppDispatch } from './hooks';
import { setRoles, setName, syncLocalStorage } from "./stateSlices/UserSlice";
import store from './store';
import { useAuth } from 'react-oidc-context';


function App() {
  const auth = useAuth();
  const dispatch = useAppDispatch()

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <LoginErrorRouter error={auth.error.message}/>;
  }

  if (auth.isAuthenticated) {
    console.log(auth.user?.profile)
    dispatch(setRoles(auth.user?.profile.roles as string[]));
    dispatch(setName(auth.user?.profile.email as string));
    return <Router />
  }
  return <LoginRouter />;
}

export default App;

window.addEventListener('storage', function (event) {
  if (event.key === "darkMode") {
    const dispatch = store.dispatch;
    const darkMode = store.getState().user.preferences.darkMode
    dispatch(syncLocalStorage(JSON.parse(localStorage.getItem('darkMode') || String(darkMode))))
  }
});