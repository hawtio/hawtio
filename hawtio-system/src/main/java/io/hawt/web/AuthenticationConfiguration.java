package io.hawt.web;

import javax.security.auth.login.Configuration;

public class AuthenticationConfiguration {

    private boolean enabled;
    private boolean noCredentials401;
    private String realm;
    private String role;
    private String rolePrincipalClasses;
    private Configuration configuration;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isNoCredentials401() {
        return noCredentials401;
    }

    public void setNoCredentials401(boolean noCredentials401) {
        this.noCredentials401 = noCredentials401;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getRolePrincipalClasses() {
        return rolePrincipalClasses;
    }

    public void setRolePrincipalClasses(String rolePrincipalClasses) {
        this.rolePrincipalClasses = rolePrincipalClasses;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }

    @Override
    public String toString() {
        return "AuthenticationConfiguration[" +
                "enabled=" + enabled +
                ", noCredentials401=" + noCredentials401 +
                ", realm='" + realm + '\'' +
                ", role(s)='" + role + '\'' +
                ", rolePrincipalClasses='" + rolePrincipalClasses + '\'' +
                ", configuration=" + configuration +
                ']';
    }
}
