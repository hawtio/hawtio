package io.hawt.keystore;

import java.util.Arrays;

/**
 * @author Hiram Chirino
 */
public class SecurityProviderDTO {

    public String supportedKeyStoreTypes[];
    public String supportedKeyAlgorithms[];

    @Override
    public String toString() {
        return "SecurityProviderDTO{" +
                "supportedKeyAlgorithms=" + Arrays.toString(supportedKeyAlgorithms) +
                ", supportedKeyStoreTypes=" + Arrays.toString(supportedKeyStoreTypes) +
                '}';
    }

    public String[] getSupportedKeyAlgorithms() {
        return supportedKeyAlgorithms;
    }

    public void setSupportedKeyAlgorithms(String[] supportedKeyAlgorithms) {
        this.supportedKeyAlgorithms = supportedKeyAlgorithms;
    }

    public String[] getSupportedKeyStoreTypes() {
        return supportedKeyStoreTypes;
    }

    public void setSupportedKeyStoreTypes(String[] supportedKeyStoreTypes) {
        this.supportedKeyStoreTypes = supportedKeyStoreTypes;
    }
}
