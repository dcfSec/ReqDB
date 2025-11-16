import { useAppDispatch } from "../hooks";
import { Navigate, useSearchParams } from "react-router";
import { setExpiresAt, setName, setRoles, setToken } from "../stateSlices/UserSlice";
import { authClient, handleError, handleResult } from "../APIClients";
import { useEffect, useState } from "react";
import { APIErrorData, APISuccessData } from "../types/Generics";
import { Auth } from "../types/API/Auth";

/**
 * Parent component for all views
 * 
 * @returns Main layout
 */
export default function LoginCallback() {
  const dispatch = useAppDispatch()

  const [authError, setAuthError] = useState("")
  const [authErrorMessage, setAuthErrorMessage] = useState("")
  const [ok, setOk] = useState(false)

  const [searchParams,] = useSearchParams();
  const b64data = searchParams.get("data")
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (b64data && !init) {
      setInit(true)
      const data = JSON.parse(atob(b64data))

      dispatch(setName(data["email"]))
      dispatch(setRoles(data["roles"]))

      authClient.get("/token").then((response) => {
        handleResult(response, okCallback, APIErrorCallback)
        setOk(true)

      }).catch((error) => {
        handleError(error, APIErrorCallback, errorCallback)
        setOk(true)
      });

      function okCallback(response: APISuccessData) {
        dispatch(setToken((response.data as Auth).access_token))
        dispatch(setExpiresAt((response.data as Auth).expires_at))
      }

      function APIErrorCallback(response: APIErrorData) {
        setAuthError(response.error)
        setAuthErrorMessage(response.message as string)
      }

      function errorCallback(error: string) {
        setAuthError("Authentication Error")
        setAuthErrorMessage(error)
      }
    }
  }, [b64data]);

  if (ok) {
    if (authError === "") {
      return <Navigate to="/?login" />
    } else {
      return <Navigate to={`/?error=${authError}&message=${authErrorMessage}`} />
    }
  } else {
    return <div>Logging in...</div>
  }
};
