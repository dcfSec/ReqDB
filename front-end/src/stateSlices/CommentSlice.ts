import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Item as Comment } from '../types/API/Comments'


interface CommentState {
  comments: Array<Comment>
}

const initialState: CommentState = {
  comments: [],
}

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: () => initialState,
    setComments: (state, action: PayloadAction<Array<Comment>>) => {
      state.comments = [...action.payload]
    },
    addComment: (state, action: PayloadAction<{ comment: Comment }>) => {
      state.comments = [
        ...state.comments,
        ...[action.payload.comment]
      ]
    },
    removeComment: (state, action: PayloadAction<{ comment: number }>) => {
      const tmp = [...state.comments]
      tmp.splice(action.payload.comment, 1);
      state.comments = [...tmp]
    },
    updateComment: (state, action) => {
      const tmp = [...state.comments]
      tmp[action.payload.index] = { ...action.payload.comment }
      state.comments = [...tmp]
    },
  },
})

export const { reset, setComments, addComment, removeComment, updateComment } = commentSlice.actions

export default commentSlice.reducer