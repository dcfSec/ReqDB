import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface EditState {
  items: Array<object>;
  cache: {
    [key: string]: {
      data: object;
      time: number
    }
  };
}

const initialState: EditState = {
  items: [],
  cache: {}
}

export const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    reset: () => initialState,
    setItems: (state, action: PayloadAction<Array<object>>) => {
      state.items = [...action.payload]
    },
    addItem: (state, action: PayloadAction<object>) => {
      state.items = [action.payload, ...state.items]
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const tmp = [...state.items]
      tmp.splice(action.payload, 1);
      state.items = [...tmp]
    },
    updateItem: (state, action: PayloadAction<{ index: number, item: object }>) => {
      const tmp = [...state.items]
      tmp[action.payload.index] = action.payload.item
      state.items = [...tmp]
    },
    updateCache: (state, action: PayloadAction<{ endpoint: string, response: object }>) => {
      const tmp = {
        data: action.payload.response,
        time: Date.now()
      }
      state.cache[action.payload.endpoint] = { ...tmp }
    },
    cleanCache: (state, action: PayloadAction<{ endpoint: string }>) => {
      const tmp = { ...state.cache }
      delete tmp[action.payload.endpoint];
      state.cache = { ...tmp }
    },
  }
})

export const { setItems, addItem, removeItem, updateItem, updateCache, cleanCache } = editSlice.actions

export default editSlice.reducer