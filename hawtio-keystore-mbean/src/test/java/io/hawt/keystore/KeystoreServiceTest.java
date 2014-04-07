package io.hawt.keystore;

import org.junit.Test;

import java.io.IOException;

import static junit.framework.Assert.assertNotNull;
import static junit.framework.Assert.assertTrue;

/**
 *
 */
public class KeystoreServiceTest {

    @Test
    public void test() throws IOException {

        KeystoreService service = new KeystoreService();
        SecurityProviderDTO info = service.getSecurityProviderInfo();
        System.out.println(info);
        assertNotNull(info);
        assertTrue(info.supportedKeyAlgorithms.length > 0);
        assertTrue(info.supportedKeyStoreTypes.length > 0);

        CreateKeyStoreRequestDTO request = new CreateKeyStoreRequestDTO();
        request.storePassword = "password";
        request.storeType = "JKS";
        request.createPrivateKey = true;
        request.keyCommonName = "localhost";
        request.keyLength = 1024;
        request.keyAlgorithm = "RSA";
        request.keyValidity = 365;
        request.keyPassword = "password";

        byte[] data = service.createKeyStore(request);
        assertNotNull(data);
        assertTrue(data.length > 0);


        request = new CreateKeyStoreRequestDTO();
        request.storePassword = "password";
        request.storeType = "JKS";
        request.createPrivateKey = false;

        data = service.createKeyStore(request);
        assertNotNull(data);
        assertTrue(data.length > 0);

    }

}
