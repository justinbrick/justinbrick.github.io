import { generateCodeVerifier, OAuth2Client, type OAuth2Token } from "@badgateway/oauth2-client";
import Microsoft from "$lib/assets/microsoft.svg";
import type { ClientSettings } from "@badgateway/oauth2-client/dist/client";
import { jwtDecode } from "jwt-decode";

/** the provider settings that will be used to both display to the user, and to log in. */
export type ProviderSettings = {
    details: {
        name: string;
        imagePath: string;
        extraParams?: Record<string, string>;
    };
    client: ClientSettings;
};

/** the current state of authentication. */
export type AuthState = {
    activeClient?: OAuth2Client;
    provider?: string;
    token?: OAuth2Token;
    idToken?: IdToken;
};

export type IdToken = {
    iss: string;
    sub: string;
    aud: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email: string;
    email_verified?: boolean;
    picture?: string;
}

/** the variable in session storage which defines the provider we went to */
const PROVIDER_LOCATION = "provider";
/** the variable in session storage which defines the code verifier (PKCE) */
const VERIFIER_LOCATION = "verify";
/** the variable in session storage which defines the access token */
const TOKEN_LOCATION = "token";
/** the scopes which we will try and grab when authenticating */
const TOKEN_SCOPES = ["openid", "profile", "email"]
/** a list of all eligible providers that we care about */
export const PROVIDERS: Record<string, ProviderSettings> = {
    msft: {
        details: {
            name: "Microsoft",
            imagePath: Microsoft,
            extraParams: {
                prompt: "select_account"
            }
        },
        client: {
            server: "https://login.microsoftonline.com/organizations/oauth2/v2.0",
            clientId: "11ec9395-8c5d-4ac7-9bc2-f4505e7053cf",
            authorizationEndpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize",
            tokenEndpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token"
        }
    }
};

/** global authentication state, meant to stay alive during the entire application */
export const authState: AuthState = $state({
});

export function getRedirectPath() {
    return `${window.location.origin}/auth`;
}

function setToken(token: OAuth2Token) {
    authState.token = token;
    if (!token.idToken) return;
    authState.idToken = jwtDecode(token.idToken) as IdToken;
}

/** attempts to refresh the token. */
async function refreshToken() {
    // no token to refresh, get out.
    if (!authState.token || !authState.activeClient) return null;
    // not expired - fast return. 5000 milliseconds for a bit of leeway.
    if (authState.token.expiresAt ?? 0 > new Date().getTime() + 5000) return;
    // otherwise, try to refresh.
    try {
        const token = await authState.activeClient.refreshToken(authState.token, {
            scope: TOKEN_SCOPES
        });
        setToken(token);
    } catch {
        console.log("failed to refresh token, stopping")
        return;
    }
}

/** attempt to load the session on start.
 * this attempts to be resilient, so that it pauses at any point where additional
 * work cannot be done. this allows re-use for both the callback system,
 * and for the token refresh.
 */
async function loadSession() {
    // prevents attempting to load session during SSG
    if (typeof window === "undefined") return;

    const provider = window.sessionStorage.getItem(PROVIDER_LOCATION);
    if (!provider) return;
    authState.provider = provider;

    const settings = PROVIDERS[provider];
    if (!settings) {
        console.warn(`got provider ${provider}, but could not find in the list of known providers!`);
        return;
    }
    authState.activeClient = new OAuth2Client(settings.client);

    const token = window.sessionStorage.getItem(TOKEN_LOCATION);
    if (!token) return;
    let authToken: OAuth2Token = JSON.parse(token);
    setToken(authToken);
    refreshToken();
}

/** mainly intended to be called from auth buttons
 * this provides a system which automatically logs in using a provider ID, and then
 * redirects back to the main page.
 */
export async function loginWithProvider(providerId: string) {
    const provider = PROVIDERS[providerId];
    if (!provider) {
        console.warn(`invalid provider id ${providerId}`);
        return;
    }

    const verifier = await generateCodeVerifier();
    window.sessionStorage.setItem(PROVIDER_LOCATION, providerId);
    window.sessionStorage.setItem(VERIFIER_LOCATION, verifier);

    const client = new OAuth2Client(provider.client);
    document.location = await client.authorizationCode.getAuthorizeUri({
        redirectUri: getRedirectPath(),
        state: providerId,
        codeVerifier: verifier,
        scope: TOKEN_SCOPES,
        extraParams: provider.details.extraParams
    });
}

/** do I need to document this? */
export function logout() {
    authState.provider = undefined;
    authState.idToken = undefined;
    authState.activeClient = undefined;
    authState.token = undefined;
    for (const location of [TOKEN_LOCATION, PROVIDER_LOCATION, VERIFIER_LOCATION]) {
        window.sessionStorage.removeItem(location);
    }
}

export async function acceptCallback() {
    if (!authState.activeClient || !authState.provider) {
        console.warn("on auth callback, with no active client");
        return;
    }

    const verifier = window.sessionStorage.getItem(VERIFIER_LOCATION);
    if (!verifier) {
        console.warn("couldn't find verifier in session storage");
        return;
    }

    const token = await authState.activeClient.authorizationCode.getTokenFromCodeRedirect(document.location.toString(), {
        redirectUri: getRedirectPath(),
        state: authState.provider,
        codeVerifier: verifier
    });

    window.sessionStorage.setItem(TOKEN_LOCATION, JSON.stringify(token));
    window.sessionStorage.removeItem(VERIFIER_LOCATION);

    document.location = document.location.origin;
}

// unlike what is typically done with React using effects, this loads instantaneously.
// removes the needs for boundaries for initial state load, and just makes my life easier.
loadSession();