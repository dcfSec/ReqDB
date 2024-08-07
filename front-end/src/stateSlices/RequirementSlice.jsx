import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  requirement: {},
}

export const requirementSlice = createSlice({
  name: 'requirement',
  initialState,
  reducers: {
    reset: () => initialState,
    setRequirement: (state, action) => {
      state.requirement = { ...action.payload }
    },
    addCommentToRequirement: (state, action) => {
      state.requirement.comments = [
        ...state.requirement.comments,
        ...[action.payload.comment]
      ]
    },
    removeCommentFromRequirement: (state, action) => {
      let tmp = [...state.requirement.comments]
      tmp.splice(action.payload.comment, 1);
      state.requirement.comments = [...tmp]
    },
  },
})

export const { reset, setRequirement, addCommentToRequirement, removeCommentFromRequirement } = requirementSlice.actions

export default requirementSlice.reducer