import { createSlice } from '@reduxjs/toolkit'

export const UserSlice = createSlice({
  name: 'User',
  initialState: {
    roles: [],
    darkMode: JSON.parse(localStorage.getItem('darkMode')) || false,
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
      state.darkMode = action.payload
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", state.darkMode ? "dark" : "light");
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
      document.getElementsByTagName('html')[0].setAttribute("data-bs-theme", state.darkMode ? "dark" : "light");
    },
  }
})

export const { setAccount, setName, setRoles, setDarkMode, toggleDarkMode } = UserSlice.actions

export default UserSlice.reducer