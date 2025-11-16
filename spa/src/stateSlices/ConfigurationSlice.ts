import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Item } from '../types/API/Configuration';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../APIClients';
import { APISuccessData } from '../types/Generics';
import store from '../store';

interface Category {
  category: string
  keys: string[]
}

interface ConfigurationState {
  configuration: {
    [key: string]: Item
  };
  categories: Category[];
}

const initialState: ConfigurationState = {
  configuration: {},
  categories: []
}

export const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    reset: () => initialState,
    loadConfiguration: () => {
      APIClient.get(`config/system`).then((response) => {
        handleResult(response, okCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    },
    setConfiguration: (state, action: PayloadAction<Array<Item>>) => {
      action.payload.forEach(item => {
        let result = state.categories.findIndex(({ category }) => category === item.category);
        if (result == -1) {
          const tmp = [...state.categories]
          tmp.push({ category: item.category, keys: [] })
          state.categories = [...tmp]
          result = state.categories.length - 1
        }
        state.categories[result].keys.push(item.key)
        item.dirty = false
        state.configuration[item.key] = { ...item }
      });
    },
    editConfigurationItem: (state, action: PayloadAction<{ key: string, value: string }>) => {
      state.configuration[action.payload.key].value = action.payload.value
      state.configuration[action.payload.key].dirty = true
    },
    removeDirty: (state, action: PayloadAction<string>) => {
      state.configuration[action.payload].dirty = false
    },
  }
})

export const { setConfiguration, editConfigurationItem, reset, loadConfiguration, removeDirty } = editSlice.actions

export default editSlice.reducer

function okCallback(response: APISuccessData) {
  store.dispatch(reset())
  store.dispatch(setConfiguration(response.data as Item[]))
}