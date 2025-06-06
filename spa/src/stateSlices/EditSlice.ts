import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { APISuccessData, APIErrorData, GenericItem } from '../types/Generics';

interface EditState {
  items: Array<GenericItem>;
  cache: {
    [key: string]: {
      data: APISuccessData | APIErrorData;
      time: number
    }
  };
  selectedCount: number
  removeList: number[]
}

const initialState: EditState = {
  items: [],
  cache: {},
  selectedCount: 0,
  removeList: [],
}

export const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    reset: () => initialState,
    setItems: (state, action: PayloadAction<Array<GenericItem>>) => {
      action.payload.forEach((item, index) => {
        action.payload[index].selected = false
      });
      state.items = [...action.payload]
    },
    addItem: (state, action: PayloadAction<GenericItem>) => {
      action.payload.selected = false
      state.items = [action.payload, ...state.items]
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const tmp = [...state.items]
      tmp.splice(action.payload, 1);
      state.items = [...tmp]
    },
    updateItem: (state, action: PayloadAction<{ index: number, item: GenericItem }>) => {
      const tmp = [...state.items]
      action.payload.item.selected = tmp[action.payload.index].selected
      tmp[action.payload.index] = action.payload.item
      state.items = [...tmp]
    },
    updateCache: (state, action: PayloadAction<{ endpoint: string, response: APISuccessData | APIErrorData }>) => {
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
    toggleSelected: (state, action: PayloadAction<number>) => {
      const tmp = [...state.items]
      tmp[action.payload].selected = !tmp[action.payload].selected
      state.items = [...tmp]
      if (tmp[action.payload].selected) {
        state.selectedCount++
      } else {
        state.selectedCount--
      }
    },
    toggleSelectAll: (state) => {
      const tmp = [...state.items]
      const action = !(state.selectedCount == state.items.length)

      tmp.forEach((item, index) => {
        tmp[index].selected = action
      });

      if (action) {
        state.selectedCount = state.items.length
      } else {
        state.selectedCount = 0
      }
      state.items = [...tmp]
    },
    addIndexToRemoveList: (state, action: PayloadAction<number>) => {
      const tmp = [...state.removeList]
      tmp.push(action.payload)
      state.removeList = [...tmp]
    },
    removeItems: (state) => {
      const tmp = [...state.items]
      const toRemove = [...state.removeList]
      toRemove.sort().reverse().forEach(function (item) {
        tmp.splice(item, 1);
        state.selectedCount--
      });
      state.items = [...tmp]
      state.removeList = []
    },
  }
})

export const { setItems, addItem, removeItem, updateItem, updateCache, cleanCache, toggleSelected, toggleSelectAll, addIndexToRemoveList, removeItems } = editSlice.actions

export default editSlice.reducer