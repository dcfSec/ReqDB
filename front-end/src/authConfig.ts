import { User, WebStorageStateStore } from "oidc-client-ts";
import { staticConfig } from "./static";


export const protectedResources = {
  ReqDB: {
    scopes: [
      "openid", "email", "offline_access", `${staticConfig.oauth.client_id}/openid`
    ]

  }
}

export const oidcConfig = {
  authority: staticConfig.oauth.authority,
  client_id: staticConfig.oauth.client_id,
  redirect_uri: `${window.location.origin}/oauth/callback`,
  //filterProtocolClaims: true,
  scope: protectedResources.ReqDB.scopes.join(" "),
  //automaticSilentRenew: true,
  mergeClaimsStrategy: { array: "merge" },
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
  Configuration: { Reader: "Configuration.Reader", Writer: "Configuration.Writer", }
}