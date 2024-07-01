import { createSlice } from '@reduxjs/toolkit'

export const mainLogoSpinnerSlice = createSlice({
  name: 'mainLogoSpinner',
  initialState: {
    visible: false
  },
  reducers: {
    show: (state, action) => {
      state.visible = action.payload
    },
  }
})

export const { show, hide } = mainLogoSpinnerSlice.actions

export default mainLogoSpinnerSlice.reducer