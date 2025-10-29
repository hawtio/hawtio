package io.hawt.web.tomcat;

import java.io.Serializable;
import java.security.Principal;

/**
 * A very simple Apache Tomcat {@link Principal}.
 */
public class TomcatPrincipal implements Principal, Serializable {

    private final String userName;

    public TomcatPrincipal(String userName) {
        this.userName = userName;
    }

    @Override
    public String getName() {
        return userName;
    }
}
