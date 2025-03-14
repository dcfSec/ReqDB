import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Item as Comment } from '../types/API/Comments'


interface CommentState {
  comments: Array<Comment>
  requirementId: number | undefined
}

const initialState: CommentState = {
  comments: [],
  requirementId: undefined
}

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: () => initialState,
    setComments: (state, action: PayloadAction<Array<Comment>>) => {
      state.comments = [...action.payload]
    },
    setRequirementId: (state, action: PayloadAction<number | undefined>) => {
      state.requirementId = action.payload
    },
    addComment: (state, action: PayloadAction<{ comment: Comment }>) => {
      state.comments = [
        ...state.comments,
        ...[action.payload.comment]
      ]
    },
    removeComment: (state, action: PayloadAction<{ index: number, force: boolean }>) => {
      const tmp = [...state.comments]
      const id = state.comments[action.payload.index].id
      tmp.splice(action.payload.index, 1);
      console.log(action.payload.force, id)
      if (action.payload.force) {
        const toDelete = getChildrenCommentIDs(state.comments[action.payload.index])
        let i = tmp.length
        while (i--) {
          if (toDelete.includes(tmp[i].id)) {
            tmp.splice(i, 1);
          }
        }
      }
      state.comments = [...tmp]
    },
    updateComment: (state, action) => {
      const tmp = [...state.comments]
      tmp[action.payload.index] = { ...action.payload.comment }
      state.comments = [...tmp]
    },
  },
})

export const { reset, setComments, addComment, removeComment, updateComment, setRequirementId } = commentSlice.actions

export default commentSlice.reducer


function getChildrenCommentIDs(comment: Comment) {
  const r: number[] = []
  comment.children.forEach(child => {
    r.push(child.id)
    r.concat(getChildrenCommentIDs(child))
  });
  return r
}