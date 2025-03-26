import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { Item } from '../types/API/Audit';


interface AuditState {
  action: {
    filterItems: Array<string>;
    filterSelected: Array<string>;
    allSelected: boolean;
  };
  items: Array<Item>;
}


const initialState: AuditState = {
  action: {
    filterItems: ["INSERT", "UPDATE", "DELETE"],
    filterSelected: ["INSERT", "UPDATE", "DELETE"],
    allSelected: true
  },
  items: []
}

export const auditSlice = createSlice({
  name: 'audit',
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
    toggleActionFilterSelected: (state, action: PayloadAction<string>) => {
      if (state.action.filterSelected.indexOf(action.payload) >= 0) {
        const tmp = state.action.filterSelected.filter(function (v) { return v !== action.payload; });
        state.action.filterSelected = [
          ...tmp
        ]
      } else {
        state.action.filterSelected = [
          ...state.action.filterSelected,
          action.payload
        ]
      }
      state.action.allSelected = state.action.filterSelected.length == state.action.filterItems.length
    },
    toggleActionFilterSelectedAll: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.action.filterSelected = [
          ...state.action.filterItems
        ]
      } else {
        state.action.filterSelected = [
        ]
      }
      state.action.allSelected = state.action.filterSelected.length == state.action.filterItems.length
    },
  },
})

export const { toggleActionFilterSelected, toggleActionFilterSelectedAll, setItems, addItem, removeItem } = auditSlice.actions

export const action = (state: RootState) => state.audit.action

export default auditSlice.reducer