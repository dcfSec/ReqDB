import { configureStore } from '@reduxjs/toolkit'
import mainLogoSpinnerReducer from './stateSlices/MainLogoSpinnerSlice'
import BrowseReducer from './stateSlices/BrowseSlice'
import catalogueDataReducer from './stateSlices/CatalogueDataSlice'
import NotificationToastReducer from './stateSlices/NotificationToastSlice'
import EditReducer from './stateSlices/EditSlice'

export default configureStore({
  reducer: {
    mainLogoSpinner: mainLogoSpinnerReducer,
    browse: BrowseReducer,
    catalogueData: catalogueDataReducer,
    notificationToast: NotificationToastReducer,
    edit: EditReducer,
  }
})