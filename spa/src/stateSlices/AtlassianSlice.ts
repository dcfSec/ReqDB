import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult, atlassianClient } from '../APIClients';
import { APISuccessData } from '../types/Generics';
import store from '../store';
import { Configuration } from '../types/API/Atlassian';


interface AtlassianState {
  enabled: boolean,
  tenant: string,
  user: string;
  token: string,
  expiresAt: number,
  authenticated: boolean
}

const initialState: AtlassianState = {
  enabled: false,
  tenant: "",
  user: "",
  token: "",
  expiresAt: 0,
  authenticated: false,
}

export const AtlassianSlice = createSlice({
  name: 'Atlassian',
  initialState,
  reducers: {
    setAtlassianToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setAtlassianTokenExpiresAt: (state, action: PayloadAction<number>) => {
      state.expiresAt = action.payload
    },
    setAtlassianAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload
    },
    setAtlassianConfiguration: (state, action: PayloadAction<Configuration>) => {
      state.tenant = action.payload.tenant
      state.user = action.payload.user
      state.enabled = action.payload.enabled
      atlassianClient.defaults.baseURL = `https://api.atlassian.com/ex/jira/${action.payload.tenant}`
    },
    loadAtlassianConfiguration: () => {
      APIClient.get(`export/jira/configuration`).then((response) => {
        handleResult(response, okCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    },
  }
})

export const { setAtlassianToken, setAtlassianTokenExpiresAt, setAtlassianAuthenticated, setAtlassianConfiguration, loadAtlassianConfiguration } = AtlassianSlice.actions

export default AtlassianSlice.reducer

function okCallback(response: APISuccessData) {
  store.dispatch(setAtlassianConfiguration(response.data as Configuration))
}