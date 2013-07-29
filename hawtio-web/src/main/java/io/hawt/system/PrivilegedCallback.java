package io.hawt.system;

import javax.security.auth.Subject;

/**
 * @author Stan Lewis
 */
public interface PrivilegedCallback {

    public void execute(Subject subject) throws Exception;
}
