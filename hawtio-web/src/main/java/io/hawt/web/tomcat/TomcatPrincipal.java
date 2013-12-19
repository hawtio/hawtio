package io.hawt.web.tomcat;

import java.io.Serializable;
import java.security.Principal;

/**
 * A very simple Apache Tomcat {@link Principal}.
 */
public class TomcatPrincipal implements Principal, Serializable {

    private final String roleName;

    public TomcatPrincipal(String roleName) {
        this.roleName = roleName;
    }

    @Override
    public String getName() {
        return roleName;
    }
}
