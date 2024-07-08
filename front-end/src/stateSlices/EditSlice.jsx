import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  items: []
}

export const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    reset: () => initialState,
    setItems: (state, action) => {
      state.items = [...action.payload]
    },
    addItem: (state, action) => {
      state.items = [action.payload, ...state.items]
    },
    removeItem: (state, action) => {
      let tmp = [...state.items]
      tmp.splice(action.payload, 1);
      state.items = [...tmp]
    },
    updateItem: (state, action) => {
      let tmp = [...state.items]
      tmp[action.payload.index] = action.payload.item
      state.items = [...tmp]
    },


  }
})

export const { setItems, addItem, removeItem, updateItem } = editSlice.actions

export default editSlice.reducer