package io.hawt.web.tomcat;

import java.io.Serializable;
import java.security.Principal;

public class TomcatPrincipal implements Principal, Serializable {

    // TODO: add role

    private final String name;

    public TomcatPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}
