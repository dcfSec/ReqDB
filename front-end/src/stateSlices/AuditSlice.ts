import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'


interface AuditState {
  action: {
    filterItems: Array<string>;
    filterSelected: Array<string>;
    allSelected: boolean;
  }
}


const initialState: AuditState = {
  action: {
    filterItems: ["INSERT", "UPDATE", "DELETE"],
    filterSelected: ["INSERT", "UPDATE", "DELETE"],
    allSelected: true
  },
}

export const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    reset: () => initialState,
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
      state.action.allSelected = JSON.stringify([...state.action.filterSelected].sort()) === JSON.stringify([...state.action.filterItems].sort());
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
      state.action.allSelected = JSON.stringify([...state.action.filterSelected].sort()) === JSON.stringify([...state.action.filterItems].sort());
    },
  },
})

export const { toggleActionFilterSelected, toggleActionFilterSelectedAll } = auditSlice.actions

export const action = (state: RootState) => state.audit.action

export default auditSlice.reducer