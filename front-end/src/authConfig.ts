import { User, WebStorageStateStore } from "oidc-client-ts";
import { staticConfig } from "./static";

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
  ReqDB: {
    scopes: [
      `${staticConfig.oauth.client_id}/ReqDB.Requirements.Reader`,
      `${staticConfig.oauth.client_id}/ReqDB.Requirements.Writer`,
      `${staticConfig.oauth.client_id}/ReqDB.Requirements.Auditor`,
      `${staticConfig.oauth.client_id}/ReqDB.Comments.Reader`,
      `${staticConfig.oauth.client_id}/ReqDB.Comments.Writer`,
      `${staticConfig.oauth.client_id}/ReqDB.Comments.Moderator`,
      `${staticConfig.oauth.client_id}/ReqDB.Comments.Auditor`,
      `${staticConfig.oauth.client_id}/openid`,
    ]

  }
}

export const oidcConfig = {
  authority: staticConfig.oauth.authority,
  client_id: staticConfig.oauth.client_id,
  redirect_uri: `${window.location.origin}/`,
  filterProtocolClaims: true,
  scope: protectedResources.ReqDB.scopes.join(" "),
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSigninCallback: (_user: User | void): void => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    )
  }
};

export const appRoles = {
  Requirements: { Reader: "Requirements.Reader", Writer: "Requirements.Writer", Auditor: "Requirements.Auditor" },
  Comments: { Reader: "Comments.Reader", Writer: "Comments.Writer", Moderator: "Comments.Moderator", Auditor: "Comments.Auditor" },
}