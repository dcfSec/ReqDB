import { useState, useMemo } from 'react';
import { NotificationToastContext,LoadingSpinnerContext, LoadingSpinnerDialogContext } from '../static'

export function NotificationToastContextProvider({ children }) {
  const [notificationToastHandler, setNotificationToastHandler] = useState(["", "", false])

  return (
    <NotificationToastContext.Provider
      value={useMemo(() => ({ notificationToastHandler, setNotificationToastHandler }), [
        notificationToastHandler, setNotificationToastHandler
      ])}
    >
      {children}
    </NotificationToastContext.Provider>
  );
}


export function LoadingSpinnerContextProvider({ children }) {
  const [showSpinner, setShowSpinner] = useState(false)

  return (
    <LoadingSpinnerContext.Provider
      value={useMemo(() => ({ showSpinner, setShowSpinner }), [
        showSpinner, setShowSpinner
      ])}
    >
      {children}
    </LoadingSpinnerContext.Provider>
  );
}


export function LoadingSpinnerDialogContextProvider({ children }) {
  const [showDialogSpinner, setShowDialogSpinner] = useState(false)

  return (
    <LoadingSpinnerDialogContext.Provider
      value={useMemo(() => ({ showDialogSpinner, setShowDialogSpinner }), [
        showDialogSpinner, setShowDialogSpinner
      ])}
    >
      {children}
    </LoadingSpinnerDialogContext.Provider>
  );
}