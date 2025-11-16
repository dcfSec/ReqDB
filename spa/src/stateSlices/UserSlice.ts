import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../APIClients';
import { APISuccessData } from '../types/Generics';
import store from '../store';
import { Item } from '../types/API/User';


interface UserState {
  roles: Array<string>,
  preferences: {
    darkMode: boolean,
    notificationMailOnCommentChain: boolean,
    notificationMailOnRequirementComment: boolean,
    atlassianCloudActive: boolean
  },
  name: string,
  token: string,
  expiresAt: number
  authenticated: boolean
}

const initialState: UserState = {
  roles: [],
  preferences: {
    darkMode: getDarkModeWithColorSchemaPreference(),
    notificationMailOnCommentChain: false,
    notificationMailOnRequirementComment: false,
    atlassianCloudActive: false,
  },
  name: "Nobody",
  token: "",
  expiresAt: 0,
  authenticated: false
}

export const UserSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setRoles: (state, action: PayloadAction<Array<string>>) => {
      state.roles = [...action.payload]
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setExpiresAt: (state, action: PayloadAction<number>) => {
      state.expiresAt = action.payload
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.preferences.darkMode = action.payload
      localStorage.setItem('darkMode', JSON.stringify(state.preferences.darkMode));
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", state.preferences.darkMode ? "dark" : "light");
    },
    toggleDarkMode: state => {
      state.preferences.darkMode = !state.preferences.darkMode
      localStorage.setItem('darkMode', JSON.stringify(state.preferences.darkMode));
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", state.preferences.darkMode ? "dark" : "light");
    },
    syncLocalStorage: (state, action: PayloadAction<boolean>) => {
      state.preferences.darkMode = action.payload
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", action.payload ? "dark" : "light");
    },
    loadUserConfiguration: () => {
      APIClient.get(`config/user`).then((response) => {
        handleResult(response, okCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    },
    setUserConfiguration: (state, action: PayloadAction<Item>) => {
      state.preferences.notificationMailOnCommentChain = action.payload.notificationMailOnCommentChain
      state.preferences.notificationMailOnRequirementComment = action.payload.notificationMailOnRequirementComment
      state.preferences.atlassianCloudActive = action.payload.atlassianCloudActive
    },
    toggleUserConfiguration: (state, action: PayloadAction<{ id: string, checked: boolean }>) => {
      switch (action.payload.id) {
        case "notification-comment-chain-switch":
          state.preferences.notificationMailOnCommentChain = action.payload.checked
          break;
        case "notification-comment-requirement-switch":
          state.preferences.notificationMailOnRequirementComment = action.payload.checked
          break;
        case "atlassianCloudActive":
          state.preferences.atlassianCloudActive = action.payload.checked
          break;
        default:
          break;
      }
    },
  }
})

export const { setName, setRoles, setToken, setExpiresAt, setAuthenticated, setDarkMode, toggleDarkMode, syncLocalStorage, loadUserConfiguration, setUserConfiguration, toggleUserConfiguration } = UserSlice.actions

export default UserSlice.reducer

function okCallback(response: APISuccessData) {
  store.dispatch(setUserConfiguration(response.data as Item))
}

function getDarkModeWithColorSchemaPreference() {
  let darkMode = false
  if (localStorage.getItem('darkMode') == undefined) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      darkMode = true
    }
  } else {
    darkMode = JSON.parse(localStorage.getItem('darkMode') || "false") || false
  }
  return darkMode
}