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
    updateComment: (state, action) => {
      let tmp = [...state.comments]
      tmp[action.payload.index] = {...action.payload.comment}
      state.comments = [...tmp]
    },
  },
})

export const { reset, setComments, addComment, removeComment, updateComment } = commentSlice.actions

export default commentSlice.reducer