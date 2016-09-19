declare module KeycloakModule {

    export interface Promise {
        success(callback: Function): Promise;
        error(callback: Function): Promise;
    }

    export interface InitOptions {
        checkLoginIframe?: boolean;
        checkLoginIframeInterval?: number;
        onLoad?: string;
    }

    export interface LoginOptions {
        prompt?: String;
        loginHint?: String;
    }

    export interface RedirectUriOptions {
        redirectUri?: String;
    }

    export interface IKeycloak {
        init(options?: InitOptions): Promise;
        login(options?: LoginOptions): Promise;
        createLoginUrl(options?: LoginOptions): string;
        logout(options?: RedirectUriOptions): Promise;
        createLogoutUrl(options?: RedirectUriOptions): string;
        createAccountUrl(options?: RedirectUriOptions): string;
        accountManagement(): Promise;
        hasRealmRole(role: string): boolean;
        hasResourceRole(role: string, resource?: string): boolean;
        loadUserProfile(): Promise;
        isTokenExpired(minValidity: number): boolean;
        updateToken(minValidity: number): Promise;

        realm: string;
        clientId: string;
        authServerUrl: string;

        token: string;
        tokenParsed: any;
        refreshToken: string;
        refreshTokenParsed: any;
        idToken: string;
        authenticated: boolean;
        subject: string;
        timeSkew: number;

        onAuthSuccess: Function;
        onAuthError: Function;
        onAuthRefreshSuccess: Function;
        onAuthRefreshError: Function;
        onAuthLogout: Function;
    }
}

declare var Keycloak: {
    new(config?: any): KeycloakModule.IKeycloak;
};