import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  items: [],
  cache: {}
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
    updateCache: (state, action) => {
      const tmp = {
        data: action.payload.response,
        time: Date.now()
      }
      state.cache[action.payload.endpoint] = {...tmp}
    },
    cleanCache: (state, action) => {
      const tmp = {...state.cache}
      delete tmp[action.payload.endpoint]; 
      state.cache = {...tmp}
    },
  }
})

export const { setItems, addItem, removeItem, updateItem, updateCache, cleanCache } = editSlice.actions

export default editSlice.reducer