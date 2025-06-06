import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface MainLogoSpinnerState {
  visible: boolean;
}

const initialState: MainLogoSpinnerState = {
  visible: false
}

export const mainLogoSpinnerSlice = createSlice({
  name: 'mainLogoSpinner',
  initialState,
  reducers: {
    showSpinner: (state, action: PayloadAction<boolean>) => {
      state.visible = action.payload
    },
  }
})

export const { showSpinner } = mainLogoSpinnerSlice.actions

export default mainLogoSpinnerSlice.reducer