import { useState, useCallback } from 'react';

import { InteractionType, PopupRequest } from '@azure/msal-browser';
import { useMsal, useMsalAuthentication } from "@azure/msal-react";

/**
 * Custom hook to call a web API using bearer token obtained from MSAL
 * @param {PopupRequest} msalRequest 
 * @returns 
 */
const useFetchWithMsal = (msalRequest: PopupRequest) => {
    const { instance } = useMsal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState(null);

    const { result, error: msalError } = useMsalAuthentication(InteractionType.Redirect, {
        ...msalRequest,
        account: instance.getActiveAccount() || undefined,
        redirectUri: '/'
    });

    /**
     * Execute a fetch request with the given options
     * @param {string} method: GET, POST, PUT, DELETE
     * @param {String} endpoint: The endpoint to call
     * @param {Object} data: The data to send to the endpoint, if any 
     * @returns JSON response
     */
    const execute = async (method: string, endpoint: string, data: object | null = null, json = true) => {
        if (msalError) {
            setError(msalError);
            return;
        }

        if (result) {
            try {
                let response = null;

                const headers = new Headers();
                const bearer = `Bearer ${result.accessToken}`;
                headers.append("Authorization", bearer);

                if (data) headers.append('Content-Type', 'application/json');

                const options = {
                    method: method,
                    headers: headers,
                    body: data ? JSON.stringify(data) : null,
                };

                setIsLoading(true);

                if (json) {
                    response = await (await fetch(`/api/${endpoint}`, options)).json();
                } else {
                    response = await fetch(`/api/${endpoint}`, options);
                }
                setData(response);

                setIsLoading(false);
                return response;
            } catch (e) {
                setError((e as Error));
                setIsLoading(false);
                throw e;
            }
        }
    };

    return {
        isLoading,
        error,
        data,
        execute: useCallback(execute, [result, msalError]), // to avoid infinite calls when inside a `useEffect`
    };
};

export default useFetchWithMsal;
