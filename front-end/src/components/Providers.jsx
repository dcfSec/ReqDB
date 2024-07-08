import { useState, useMemo, createContext } from 'react';

// Global states
export const LoadingSpinnerContext = createContext({});
export const LoadingSpinnerDialogContext = createContext({});

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