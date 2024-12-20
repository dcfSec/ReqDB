import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AccountInfo } from "@azure/msal-browser";

interface UserState {
  roles: Array<string>,
  preferences: {
    darkMode: boolean,
    notificationMailOnCommentChain: boolean,
    notificationMailOnRequirementComment: boolean,
  },
  name: string,
  account: AccountInfo | null
}

const initialState: UserState = {
  roles: [],
  preferences: {
    darkMode: JSON.parse(localStorage.getItem('darkMode') || "false") || false,
    notificationMailOnCommentChain: false,
    notificationMailOnRequirementComment: false,
  },
  name: "Nobody",
  account: null
}

export const UserSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<AccountInfo>) => {
      state.account = { ...action.payload }
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setRoles: (state, action: PayloadAction<Array<string>>) => {
      state.roles = [...action.payload]
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
  }
})

export const { setAccount, setName, setRoles, setDarkMode, toggleDarkMode } = UserSlice.actions

export default UserSlice.reducer