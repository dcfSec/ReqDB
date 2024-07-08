import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  visible: false,
  header: "",
  body: ""
}

export const NotificationToastSlice = createSlice({
  name: 'notificationToast',
  initialState,
  reducers: {
    reset: () => initialState,
    showToast: (state, action) => {
        state.visible = action.payload
      },
    setToastHeader: (state, action) => {
        state.header = action.payload
      },
    setToastBody: (state, action) => {
        state.body = action.payload
    },
    toast: (state, action) => {
      state.header = action.payload.header
      state.body = action.payload.body
      state.visible = true
    }
  }
})

export const { showToast, setHeader, setBody, toast } = NotificationToastSlice.actions

export default NotificationToastSlice.reducer