import { configureStore } from '@reduxjs/toolkit'
import mainLogoSpinnerReducer from './stateSlices/MainLogoSpinnerSlice'
import BrowseReducer from './stateSlices/BrowseSlice'
import catalogueDataReducer from './stateSlices/CatalogueDataSlice'
import NotificationToastReducer from './stateSlices/NotificationToastSlice'
import EditReducer from './stateSlices/EditSlice'
import UserReducer from './stateSlices/UserSlice'
import RequirementReducer from './stateSlices/RequirementSlice'
import CommentReducer from './stateSlices/CommentSlice'
import LayoutReducer from './stateSlices/LayoutSlice'
import AuditReducer from './stateSlices/AuditSlice'

const store = configureStore({
  reducer: {
    mainLogoSpinner: mainLogoSpinnerReducer,
    browse: BrowseReducer,
    catalogueData: catalogueDataReducer,
    notificationToast: NotificationToastReducer,
    edit: EditReducer,
    user: UserReducer,
    requirement: RequirementReducer,
    comment: CommentReducer,
    layout: LayoutReducer,
    audit: AuditReducer,
  }
})

export default store;