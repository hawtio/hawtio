package io.hawt.system;

import io.hawt.util.Strings;

/**
 *
 */
public class AuthInfo {

    public String username;
    public String password;

    public boolean set() {
        return Strings.isNotBlank(username) && Strings.isNotBlank(password);
    }

}
