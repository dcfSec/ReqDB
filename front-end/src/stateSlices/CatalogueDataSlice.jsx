import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  items: []
}

export const catalogueDataSlice = createSlice({
  name: 'catalogueData',
  initialState,
  reducers: {
    reset: () => initialState,
    set: (state, action) => {
      state.items = [...action.payload]
    },
    sort: state => {
      let tmp = [...state.items]
      tmp.sort((a, b) => {
        const nameA = a.title.toUpperCase();
        const nameB = b.title.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      state.items = [...tmp]
    },
  }
})

export const { set, reset, sort } = catalogueDataSlice.actions

export default catalogueDataSlice.reducer