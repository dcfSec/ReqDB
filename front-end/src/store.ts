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
import ConfigurationReducer from './stateSlices/ConfigurationSlice'

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
    configuration: ConfigurationReducer,
  }
})

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {mainLogoSpinner: mainLogoSpinnerState, browse: BrowseState, catalogueData: catalogueDataState, notificationToast: NotificationToastState, edit: EditState, user: UserState, requirement: RequirementState, comment: CommentState, layout: LayoutState, audit: AuditState}
export type AppDispatch = typeof store.dispatch