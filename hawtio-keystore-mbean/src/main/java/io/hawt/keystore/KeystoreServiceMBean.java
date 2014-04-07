package io.hawt.keystore;

import java.io.IOException;

/**
 * @author Hiram Chirino
 */
public interface KeystoreServiceMBean {

    SecurityProviderDTO getSecurityProviderInfo();
    byte[] createKeyStore(CreateKeyStoreRequestDTO request) throws IOException;

    String createKeyStoreViaJSON(String request) throws IOException;

}
