import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface NotificationToastState {
  visible: boolean;
  header: string;
  body: string;
}

const initialState: NotificationToastState = {
  visible: false,
  header: "",
  body: ""
}

export const NotificationToastSlice = createSlice({
  name: 'notificationToast',
  initialState,
  reducers: {
    reset: () => initialState,
    showToast: (state, action: PayloadAction<boolean>) => {
      state.visible = action.payload
    },
    setToastHeader: (state, action: PayloadAction<string>) => {
      state.header = action.payload
    },
    setToastBody: (state, action: PayloadAction<string>) => {
      state.body = action.payload
    },
    toast: (state, action: PayloadAction<{ header: string; body: string }>) => {
      state.header = action.payload.header
      state.body = action.payload.body
      state.visible = true
    }
  }
})

export const { showToast, setToastHeader, setToastBody, toast } = NotificationToastSlice.actions

export default NotificationToastSlice.reducer