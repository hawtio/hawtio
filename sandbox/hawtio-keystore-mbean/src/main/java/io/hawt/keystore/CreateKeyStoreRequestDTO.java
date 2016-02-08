package io.hawt.keystore;

/**
 * @author Hiram Chirino
 */
public class CreateKeyStoreRequestDTO {
    public String  storePassword;
    public String  storeType;
    public boolean createPrivateKey;
    public String  keyCommonName;
    public long    keyLength;
    public String  keyAlgorithm;
    public int     keyValidity;
    public String  keyPassword;

    public boolean isCreatePrivateKey() {
        return createPrivateKey;
    }

    public void setCreatePrivateKey(boolean createPrivateKey) {
        this.createPrivateKey = createPrivateKey;
    }

    public String getKeyAlgorithm() {
        return keyAlgorithm;
    }

    public void setKeyAlgorithm(String keyAlgorithm) {
        this.keyAlgorithm = keyAlgorithm;
    }

    public String getKeyCommonName() {
        return keyCommonName;
    }

    public void setKeyCommonName(String keyCommonName) {
        this.keyCommonName = keyCommonName;
    }

    public long getKeyLength() {
        return keyLength;
    }

    public void setKeyLength(long keyLength) {
        this.keyLength = keyLength;
    }

    public String getKeyPassword() {
        return keyPassword;
    }

    public void setKeyPassword(String keyPassword) {
        this.keyPassword = keyPassword;
    }

    public int getKeyValidity() {
        return keyValidity;
    }

    public void setKeyValidity(int keyValidity) {
        this.keyValidity = keyValidity;
    }

    public String getStorePassword() {
        return storePassword;
    }

    public void setStorePassword(String storePassword) {
        this.storePassword = storePassword;
    }

    public String getStoreType() {
        return storeType;
    }

    public void setStoreType(String storeType) {
        this.storeType = storeType;
    }
}
