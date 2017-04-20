package io.hawt.system;

/**
 * Callback for extracting authentication information
 */
public interface ExtractAuthInfoCallback {

    void getAuthInfo(String userName, String password);

}
