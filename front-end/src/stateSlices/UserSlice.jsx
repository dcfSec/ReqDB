import { createSlice } from '@reduxjs/toolkit'

export const UserSlice = createSlice({
  name: 'User',
  initialState: {
    roles: [],
    preferences: {
      darkMode: JSON.parse(localStorage.getItem('darkMode')) || false,
      notificationMailOnCommentChain: false,
      notificationMailOnRequirementComment: false,
    },
    name: "Nobody",
    account: null
  },
  reducers: {
    setAccount: (state, action) => {
      state.account = {...action.payload}
    },
    setName: (state, action) => {
      state.name = action.payload
    },
    setRoles: (state, action) => {
      state.roles = [...action.payload]
    },
    setDarkMode: (state, action) => {
      state.preferences.darkMode = action.payload
      localStorage.setItem('darkMode', JSON.stringify(state.preferences.darkMode));
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", state.preferences.darkMode ? "dark" : "light");
    },
    toggleDarkMode: (state) => {
      state.preferences.darkMode = !state.preferences.darkMode
      localStorage.setItem('darkMode', JSON.stringify(state.preferences.darkMode));
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", state.preferences.darkMode ? "dark" : "light");
    },
  }
})

export const { setAccount, setName, setRoles, setDarkMode, toggleDarkMode } = UserSlice.actions

export default UserSlice.reducer