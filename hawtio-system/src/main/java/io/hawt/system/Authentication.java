package io.hawt.system;

import io.hawt.util.Strings;
import org.apache.commons.codec.binary.Base64;

import javax.servlet.http.HttpServletRequest;
import java.util.function.BiConsumer;

/**
 * Constants and utility methods for HTTP authentication
 */
public class Authentication {

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String AUTHENTICATION_SCHEME_BASIC = "Basic";
    public static final String AUTHENTICATION_SCHEME_BEARER = "Bearer";
    public static final String ATTRIBUTE_X509_CERTIFICATE = "javax.servlet.request.X509Certificate";


    private Authentication() {

    }


    /**
     * Extracts username/password from Authorization header.
     * Callback is invoked only when Authorization header is present.
     */
    public static void extractAuthHeader(HttpServletRequest request, BiConsumer<String, String> callback) {
        String authHeader = request.getHeader(HEADER_AUTHORIZATION);
        if (Strings.isBlank(authHeader)) {
            return;
        }

        String[] parts = authHeader.trim().split(" ");
        if (parts.length != 2) {
            return;
        }

        String authType = parts[0];
        String authInfo = parts[1];

        if (authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BASIC)) {
            String decoded = new String(Base64.decodeBase64(authInfo));
            int delimiter = decoded.indexOf(':');
            if (delimiter < 0) {
                return;
            }
            String username = decoded.substring(0, delimiter);
            String password = decoded.substring(delimiter + 1);
            callback.accept(username, password);
        }

        if (authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BEARER)) {
            String username = "token";
            String password = authInfo;
            callback.accept(username, password);
        }
    }

}
