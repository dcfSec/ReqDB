import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface NotificationToastState {
  toasts: Toast[],
}

interface Toast {
  header: string;
  body: string;
}

const initialState: NotificationToastState = {
  toasts: [],
}

export const NotificationToastSlice = createSlice({
  name: 'notificationToast',
  initialState,
  reducers: {
    reset: () => initialState,
    removeToast: (state, action: PayloadAction<number>) => {
      const tmp = [...state.toasts]
      tmp.splice(action.payload, 1);
      state.toasts = [...tmp]
    },
    toast: (state, action: PayloadAction<{ header: string; body: string }>) => {
      const toast = {
        header: action.payload.header,
        body: action.payload.body
      }
      state.toasts = [...state.toasts, toast]
    }
  }
})

export const { removeToast, toast } = NotificationToastSlice.actions

export default NotificationToastSlice.reducer