import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  roles: Array<string>,
  preferences: {
    darkMode: boolean,
    notificationMailOnCommentChain: boolean,
    notificationMailOnRequirementComment: boolean,
  },
  name: string,
}

const initialState: UserState = {
  roles: [],
  preferences: {
    darkMode: JSON.parse(localStorage.getItem('darkMode') || "false") || false,
    notificationMailOnCommentChain: false,
    notificationMailOnRequirementComment: false,
  },
  name: "Nobody",
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
  }
})

export const { setName, setRoles, setDarkMode, toggleDarkMode, syncLocalStorage } = UserSlice.actions

export default UserSlice.reducer