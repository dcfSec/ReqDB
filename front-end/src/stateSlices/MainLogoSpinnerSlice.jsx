import { createSlice } from '@reduxjs/toolkit'

export const mainLogoSpinnerSlice = createSlice({
  name: 'mainLogoSpinner',
  initialState: {
    visible: false
  },
  reducers: {
    showSpinner: (state, action) => {
      state.visible = action.payload
    },
  }
})

export const { showSpinner } = mainLogoSpinnerSlice.actions

export default mainLogoSpinnerSlice.reducer