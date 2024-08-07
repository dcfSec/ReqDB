import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  comments: [],
}

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: () => initialState,
    setComments: (state, action) => {
      state.comments = [ ...action.payload ]
    },
    addComment: (state, action) => {
      state.comments = [
        ...state.comments,
        ...[action.payload.comment]
      ]
    },
    removeComment: (state, action) => {
      let tmp = [...state.comments]
      tmp.splice(action.payload.comment, 1);
      state.comments = [...tmp]
    },
  },
})

export const { reset, setComments, addComment, removeComment } = commentSlice.actions

export default commentSlice.reducer