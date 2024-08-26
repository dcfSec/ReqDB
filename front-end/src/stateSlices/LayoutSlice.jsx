import { createSlice } from '@reduxjs/toolkit'

export const LayoutSlice = createSlice({
  name: 'Layout',
  initialState: {
    breadcrumbs: [],
    pageTitle: ""
  },
  reducers: {
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = [...action.payload]
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload
      document.title = `${action.payload} | ReqDB - Requirement Database`;
    },
  }
})

export const { setBreadcrumbs, setPageTitle } = LayoutSlice.actions

export default LayoutSlice.reducer