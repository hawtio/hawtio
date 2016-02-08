package io.hawt.system;

import javax.security.auth.Subject;

/**
 *
 */
public interface PrivilegedCallback {

    public void execute(Subject subject) throws Exception;

}
