import { getDataServerAddress, getMainCookieDomain, getMainDomain } from "@/utils/fetch";

export async function authenticateWithDiscord(app, code) {
    if (!app || !code) return { error: true, errorMessage: "Empty authentication request" };

    const authenticationRequest = await fetch(`${getDataServerAddress()}/auth/discord-login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code
        })
    }).then(res => res.json());

    console.log("[Auth]", authenticationRequest);

    if (authenticationRequest.error) {
        console.warn("Authentication error:", authenticationRequest.for_a_developer);
        return { error: true, errorMessage: authenticationRequest.message };
    }

    app.auth.token = authenticationRequest.token;
    // const rootDomain = window.location.host.includes("slmn.gg") ? "slmn.gg" : window.location.hostname;
    console.log("[auth] setting on domain", getMainCookieDomain());
    app.$cookies.set("token", authenticationRequest.token, "3d", null, getMainCookieDomain());
    app.$cookies.set("token", authenticationRequest.token, "3d", null, "." + getMainCookieDomain());
    app.auth.user = authenticationRequest.user;

    return {
        error: false
    };
}

export function isOnMainDomain() {
    return window.location.origin === getMainDomain();
}

export function setAuthNext(app, path) {
    const url = path.startsWith("http") ? path : ((window.location.origin === getMainDomain() ? "" : window.location.origin) + path);

    console.log("[auth] auth_next", url, "->", getMainDomain());
    if (localStorage.getItem("auth_next")) return console.warn("[auth] Not re-setting auth next since it's already present as", localStorage.getItem("auth_next"));
    localStorage.setItem("auth_next", url);

    if (app) {
        app.$cookies.set("auth_next", url, "1d", null, getMainDomain());
        app.$cookies.set("auth_next", url, "1d", null, "." + getMainDomain());
    }
}

export function getAuthNext(app) {
    const next = localStorage.getItem("auth_next") || (app?.$cookies.get("auth_next"));
    console.log("[auth] auth_next", next);

    app?.$cookies.remove("auth_next");
    localStorage.removeItem("auth_next");

    return next;
}

export async function authenticateWithToken(app, token) {
    if (!app || !token) return { error: true, errorMessage: "Empty authentication request" };
    console.log("Authenticating with SLMN.GG token");

    const authenticationRequest = await fetch(`${getDataServerAddress()}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token
        })
    }).then(res => res.json());

    console.log("[Auth]", authenticationRequest);

    if (authenticationRequest.error) {
        console.warn("Authentication error:", authenticationRequest.for_a_developer);

        if (authenticationRequest.message === "Unknown token") {
            console.log("[Auth] removing token since the server doesn't recognise it.");
            app.$cookies.remove("token");
            localStorage.removeItem("token");
        }

        return { error: true, errorMessage: authenticationRequest.message };
    }

    app.auth.user = authenticationRequest.user;
    app.auth.token = token;
    return {
        error: false
    };
}

export async function getAuthenticationRedirect() {
    // redirect to Discord for auth
}

export function isAuthenticated(app) {
    return !!app.auth?.user;
}
