import { configureStore } from '@reduxjs/toolkit'
import mainLogoSpinnerReducer from './stateSlices/MainLogoSpinnerSlice'
import BrowseReducer from './stateSlices/BrowseSlice'

export default configureStore({
  reducer: {
    mainLogoSpinner: mainLogoSpinnerReducer,
    browse: BrowseReducer,
  }
})