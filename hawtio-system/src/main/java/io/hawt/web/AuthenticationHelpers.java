package io.hawt.web;

public final class AuthenticationHelpers {

    /**
     * Is the realm empty or * to denote any realm.
     */
    public static boolean isEmptyOrAllRealm(String realm) {
        if (realm == null || realm.trim().isEmpty() || realm.trim().equals("*")) {
            return true;
        } else {
            return false;
        }
    }
}
