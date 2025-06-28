import axios, { AxiosResponse } from 'axios';
import store from './store';
import { showSpinner } from './stateSlices/MainLogoSpinnerSlice';
import { APIErrorData, APISuccessData } from './types/Generics';
import { toast } from './stateSlices/NotificationToastSlice';
import { setAuthenticated, setExpiresAt, setToken } from './stateSlices/UserSlice';


const apiClient = axios.create({
  baseURL: "/api",
});

export const authClient = axios.create({
  baseURL: "/auth",
});

apiClient.interceptors.request.use(function (config) {
  const token = store.getState().user.token
  if (token != "") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    return Promise.reject("Token missing");
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }
    return authClient.get("/token").then((response) => {

      store.dispatch(setToken(response.data.data["access_token"]))
      store.dispatch(setExpiresAt(response.data.data["expires_at"]))
      error.response.config.headers["Authorization"] =
        "Bearer " + response.data.data["access_token"];
      return axios(error.response.config);
    })
      .catch((authError) => {
        store.dispatch(setToken(""))
        store.dispatch(setExpiresAt(0))
        store.dispatch(setAuthenticated(false))
        return Promise.reject(authError);
      })
  }
);

export function handleResult(response: AxiosResponse, okCallback: (arg0: APISuccessData) => void, APIErrorCallback: (arg0: APIErrorData) => void) {
  if (response && [200, 201, 204].indexOf(response.status) >= 0) {
    okCallback(response.data)
  } else {
    APIErrorCallback(response.data)
  }
  store.dispatch(showSpinner(false))
}

export function handleError(error: { response: { data: APIErrorData; }; message: string; }, APIErrorCallback: (arg0: APIErrorData) => void, errorCallback: (arg0: string) => void,) {
  if (error.response) {
    APIErrorCallback(error.response.data);
  } else {
    errorCallback(error.message);
  }
  store.dispatch(showSpinner(false))
}

export function APIErrorToastCallback(response: APIErrorData) {
  store.dispatch(toast({ header: response.error, body: response.message }))
}

export function errorToastCallback(error: string) {
  store.dispatch(toast({ header: "UnhandledError", body: error }))
}

export default apiClient
