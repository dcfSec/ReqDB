import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface Breadcrumb {
  title: string;
  href: string;
  active: boolean;
}

interface LayoutState {
  breadcrumbs: Array<Breadcrumb>;
  pageTitle: string;
}

const initialState: LayoutState = {
  breadcrumbs: [],
  pageTitle: ""
}

export const LayoutSlice = createSlice({
  name: 'Layout',
  initialState,
  reducers: {
    setBreadcrumbs: (state, action: PayloadAction<Array<Breadcrumb>>) => {
      state.breadcrumbs = [...action.payload]
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload
      document.title = `${action.payload} | ReqDB - Requirement Database`;
    },
  }
})

export const { setBreadcrumbs, setPageTitle } = LayoutSlice.actions

export default LayoutSlice.reducer