import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Item } from '../types/API/Requirements';
import { Item as Comment } from '../types/API/Comments';

interface RequirementState {
  requirement: Item | undefined;
}

const initialState: RequirementState = {
  requirement: undefined,
}

export const requirementSlice = createSlice({
  name: 'requirement',
  initialState,
  reducers: {
    reset: () => initialState,
    setRequirement: (state, action: PayloadAction<Item>) => {
      state.requirement = { ...action.payload }
    },
    addCommentToRequirement: (state, action: PayloadAction<{ comment: Comment }>) => {
      if (state.requirement) {
        state.requirement.comments = [
          ...state.requirement.comments,
          ...[action.payload.comment]
        ]
      }
    },
    removeCommentFromRequirement: (state, action: PayloadAction<{ comment: number }>) => {
      if (state.requirement) {
        const tmp = [...state.requirement.comments]
        tmp.splice(action.payload.comment, 1);
        state.requirement.comments = [...tmp]
      }
    },
    updateCommentInRequirement: (state, action: PayloadAction<{ index: number, comment: Comment }>) => {
      if (state.requirement) {
        const tmp = [...state.requirement.comments]
        tmp[action.payload.index] = action.payload.comment
        state.requirement.comments = [...tmp]
      }
    },
  },
})

export const { reset, setRequirement, addCommentToRequirement, removeCommentFromRequirement, updateCommentInRequirement } = requirementSlice.actions

export default requirementSlice.reducer