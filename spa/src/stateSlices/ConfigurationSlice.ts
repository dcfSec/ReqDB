import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Item } from '../types/API/Configuration';
import APIClient, { unauthApiClient, APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../APIClients';
import { APISuccessData } from '../types/Generics';
import store from '../store';

interface StaticConfig {
  oauth: {
    provider: string
  };
  home: {
    title: string;
    MOTD: {
      pre: string
      post: string
    };
  };
  login: {
    MOTD: {
      pre: string
      post: string
    };
  };
}

interface Category {
  category: string
  keys: string[]
}

interface ConfigurationState {
  configuration: {
    [key: string]: Item
  };
  categories: Category[];
  static: StaticConfig;
}

const initialState: ConfigurationState = {
  configuration: {},
  categories: [],
  static: {
    oauth: {
      provider: "",
    },
    home: {
      title: "",
      MOTD: {
        pre: "",
        post: "",
      },
    },
    login: {
      MOTD: {
        pre: "",
        post: "",
      }
    }
  }
}

export const configurationSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    reset: () => initialState,
    resetSystem: (state) => {
      state.configuration = {}
    },
    resetStatic: (state) => {
      state.static = initialState.static
    },
    loadSystemConfiguration: () => {
      APIClient.get(`config/system`).then((response) => {
        handleResult(response, okSystemCallback, APIErrorToastCallback)
      }).catch((error) => {
        handleError(error, APIErrorToastCallback, errorToastCallback)
      });
    },
    loadStaticConfiguration: (state) => {
      let storedConfig;
      try {
        storedConfig = JSON.parse(sessionStorage.getItem("static") || "{}") || {};
      } catch (error) {
        console.error("Error parsing stored config:", error);
        storedConfig = {};
      }
      if (Object.keys(storedConfig).length === 0) {
        unauthApiClient.get(`config/static`).then((response) => {
          handleResult(response, okStaticCallback, APIErrorToastCallback)
        }).catch((error) => {
          handleError(error, APIErrorToastCallback, errorToastCallback)
        });
      } else {
        state.static = { ...storedConfig }
      }
    },
    setSystemConfiguration: (state, action: PayloadAction<Array<Item>>) => {
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
    setStaticConfiguration: (state, action: PayloadAction<StaticConfig>) => {
      sessionStorage.setItem("static", JSON.stringify({ ...action.payload }));
      state.static = { ...action.payload }
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

export const { setSystemConfiguration, setStaticConfiguration, editConfigurationItem, reset, resetSystem, resetStatic, loadSystemConfiguration, loadStaticConfiguration, removeDirty } = configurationSlice.actions

export default configurationSlice.reducer

function okSystemCallback(response: APISuccessData) {
  store.dispatch(resetSystem())
  store.dispatch(setSystemConfiguration(response.data as Item[]))
}

function okStaticCallback(response: APISuccessData) {
  store.dispatch(resetStatic())
  store.dispatch(setStaticConfiguration(response.data as StaticConfig))
}