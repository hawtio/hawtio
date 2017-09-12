package io.hawt.system;

import io.hawt.util.Strings;

/**
 * Authentication information that represents a set of user name and password.
 */
public class AuthInfo {

    public String username;
    public String password;

    public boolean isSet() {
        return Strings.isNotBlank(username) && Strings.isNotBlank(password);
    }

}
