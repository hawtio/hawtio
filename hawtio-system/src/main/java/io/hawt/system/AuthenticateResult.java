package io.hawt.system;

/**
 * Authentication result
 */
public class AuthenticateResult {
    public enum Type {
        AUTHORIZED,
        NOT_AUTHORIZED,
        NO_CREDENTIALS,
        THROTTLED
    }

    public static AuthenticateResult authorized() {
        return new AuthenticateResult(Type.AUTHORIZED);
    }

    public static AuthenticateResult notAuthorized() {
        return new AuthenticateResult(Type.NOT_AUTHORIZED);
    }

    public static AuthenticateResult noCredentials() {
        return new AuthenticateResult(Type.NO_CREDENTIALS);
    }

    public static AuthenticateResult throttled(long retryAfter) {
        return new AuthenticateResult(Type.THROTTLED, retryAfter);
    }

    private final Type type;

    // Optional parameters
    private long retryAfter = 0;

    private AuthenticateResult(Type type) {
        this.type = type;
    }

    private AuthenticateResult(Type type, long retryAfter) {
        this.type = type;
        this.retryAfter = retryAfter;
    }

    public boolean is(Type type) {
        return this.type == type;
    }

    public Type getType() {
        return type;
    }

    public long getRetryAfter() {
        return retryAfter;
    }
}
