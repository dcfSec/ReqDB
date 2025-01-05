import axios, { AxiosResponse } from 'axios';
import store from './store';
import { showSpinner } from './stateSlices/MainLogoSpinnerSlice';
import { APIErrorData, APISuccessData } from './types/Generics';
import { toast } from './stateSlices/NotificationToastSlice';

export default axios.create({
  baseURL: "/api",
});

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
  store.dispatch(toast({ header: response.error, body: response.message as string }))
}

export function errorToastCallback(error: string) {
  store.dispatch(toast({ header: "UnhandledError", body: error }))
}