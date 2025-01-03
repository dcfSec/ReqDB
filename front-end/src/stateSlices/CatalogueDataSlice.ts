import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Item as Catalogue } from '../types/API/Catalogues'

interface CatalogueDataState {
  items: Array<Catalogue>
}

const initialState: CatalogueDataState = {
  items: []
}

export const catalogueDataSlice = createSlice({
  name: 'catalogueData',
  initialState,
  reducers: {
    reset: () => initialState,
    set: (state, action: PayloadAction<Array<Catalogue>>) => {
      state.items = [...action.payload]
    },
    sort: state => {
      const tmp = [...state.items]
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