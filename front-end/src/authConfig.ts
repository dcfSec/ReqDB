/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from "@azure/msal-browser";

let clientID = sessionStorage.getItem("clientID") || "";
let tenantID = sessionStorage.getItem("tenantID") || "";

if (clientID === "" || tenantID === "") {
  const config = await fetch('/api/config/oauth').then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
    .then(data => {
      return {
        clientID: data.data.client_id,
        tenantID: data.data.tenant_id
      }
    })
    .catch(error => {
      console.error('Error:', error);
      return {
        clientID: "",
        tenantID: ""
      }
    });
  sessionStorage.setItem("key", config.clientID);
  sessionStorage.setItem("key", config.tenantID);
  clientID = config.clientID;
  tenantID = config.tenantID;
}




/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig = {
  auth: {
    clientId: clientID, // This is the ONLY mandatory field that you need to supply.
    authority: `https://login.microsoftonline.com/${tenantID}`, // Defaults to "https://login.microsoftonline.com/common"
    redirectUri: "/", // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    postLogoutRedirectUri: "/", // Indicates the page to navigate after logout.
    clientCapabilities: ["CP1"] // this lets the resource owner know that this client is capable of handling claims challenge.
  },
  cache: {
    cacheLocation: "localStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    claimsBasedCachingEnabled: true,
  },
  system: {
    loggerOptions: {
      /**
       * Below you can configure MSAL.js logs. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/msal-logging-js
       */
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          case LogLevel.Info:
          default:
            console.info(message);
            return;
        }
      }
    }
  }
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
  ReqDB: {
    scopes: [
      `api://${clientID}/ReqDB.Requirements.Reader`,
      `api://${clientID}/ReqDB.Requirements.Writer`,
      `api://${clientID}/ReqDB.Requirements.Auditor`,
      `api://${clientID}/ReqDB.Comments.Reader`,
      `api://${clientID}/ReqDB.Comments.Writer`,
      `api://${clientID}/ReqDB.Comments.Moderator`,
      `api://${clientID}/ReqDB.Comments.Auditor`,
    ]

  }
}

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: [...protectedResources.ReqDB.scopes]
};

export const appRoles = {
  Requirements: { Reader: "Requirements.Reader", Writer: "Requirements.Writer", Auditor: "Requirements.Auditor" },
  Comments: { Reader: "Comments.Reader", Writer: "Comments.Writer", Moderator: "Comments.Moderator", Auditor: "Comments.Auditor" },
}