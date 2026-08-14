import { generateCodeVerifier, OAuth2Client, type OAuth2Token } from "@badgateway/oauth2-client";
import Microsoft from "$lib/assets/microsoft.svg";
import type { ClientSettings } from "@badgateway/oauth2-client/dist/client";

/** the provider settings that will be used to both display to the user, and to log in. */
export type ProviderSettings = {
    details: {
        name: string;
        imagePath: string;
        extraParams: Record<string, string>;
    };
    client: ClientSettings;
};

/** the current state of authentication. */
export type AuthState = {
    activeClient?: OAuth2Client;
    provider?: string;
    token?: OAuth2Token;
};

/** the variable in session storage which defines the provider we went to */
const PROVIDER_LOCATION = "provider";
/** the variable in session storage which defines the code verifier (PKCE) */
const VERIFIER_LOCATION = "verify";
/** the variable in session storage which defines the access token */
const TOKEN_LOCATION = "token";
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

export const authState: AuthState = $state({
});

export function getRedirectPath() {
    return `${window.location.origin}/auth`;
}

/** global authentication state, meant to stay alive during the entire application */

/** attempt to load the session. */
function loadSession() {
    if (typeof window === "undefined") return;

    const provider = window.sessionStorage.getItem(PROVIDER_LOCATION);
    if (!provider) return;

    const settings = PROVIDERS[provider];
    if (!settings) {
        console.warn(`got provider ${provider}, but could not find in the list of known providers!`);
        return;
    }

    const token = window.sessionStorage.getItem(TOKEN_LOCATION);
    if (!token) return;

    authState.provider = provider;
    authState.activeClient = new OAuth2Client(settings.client);
    authState.token = JSON.parse(token);
}

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
        scope: ["openid", "email", "profile"],
        extraParams: provider.details.extraParams
    });
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

    document.location = document.location.origin;
}

loadSession();