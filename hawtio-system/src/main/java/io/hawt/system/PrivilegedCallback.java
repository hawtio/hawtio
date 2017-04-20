package io.hawt.system;

import javax.security.auth.Subject;

/**
 * Privileged callback
 */
public interface PrivilegedCallback {

    public void execute(Subject subject) throws Exception;

}
