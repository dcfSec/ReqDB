import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { APISuccessData, APIErrorData } from '../types/Generics';

import { Item as Catalogue } from '../types/API/Catalogues';
import { Item as Extra } from '../types/API/Extras';
import { Type } from '../types/API/Extras';
import { Item as Requirement } from "../types/API/Requirements";
import { Item as Tag } from "../types/API/Tags";
import { Item as Topic } from "../types/API/Topics";

type Item = Catalogue | Extra | Type | Requirement | Tag | Topic

interface EditState {
  items: Array<Item>;
  cache: {
    [key: string]: {
      data: APISuccessData | APIErrorData;
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
    setItems: (state, action: PayloadAction<Array<Item>>) => {
      state.items = [...action.payload]
    },
    addItem: (state, action: PayloadAction<Item>) => {
      state.items = [action.payload, ...state.items]
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const tmp = [...state.items]
      tmp.splice(action.payload, 1);
      state.items = [...tmp]
    },
    updateItem: (state, action: PayloadAction<{ index: number, item: Item }>) => {
      const tmp = [...state.items]
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
  }
})

export const { setItems, addItem, removeItem, updateItem, updateCache, cleanCache } = editSlice.actions

export default editSlice.reducer