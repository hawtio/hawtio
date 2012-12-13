package io.hawt.web.dev;

import org.apache.log4j.Logger;

/**
 * @author Stan Lewis
 */
public class Config {

    static private Config _instance = null;

    static private final Logger LOG = Logger.getLogger(Config.class);

    private String contentDirectory = null;
    private String proxyHost = "localhost";
    private String proxyPath = "";
    private int proxyPort = 8181;
    private int maxFileUploadSize = 5 * 1024 * 1024;

    public Config() {
        _instance = this;
        LOG.debug("hawtio-web dev config object created");
    }

    public void setContentDirectory(String directory) {
        LOG.debug("Setting content directory to " + directory);
        this.contentDirectory = directory;
    }

    public String getContentDirectory() {
        return contentDirectory;
    }

    public static Config getInstance() {
        return _instance;
    }

    public String getProxyHost() {
        return proxyHost;
    }

    public void setProxyHost(String proxyHost) {
        this.proxyHost = proxyHost;
    }

    public int getProxyPort() {
        return proxyPort;
    }

    public void setProxyPort(int proxyPort) {
        this.proxyPort = proxyPort;
    }

    public int getMaxFileUploadSize() {
        return maxFileUploadSize;
    }

    public void setMaxFileUploadSize(int maxFileUploadSize) {
        this.maxFileUploadSize = maxFileUploadSize;
    }

    public String getProxyPath() {
        return proxyPath;
    }

    public void setProxyPath(String proxyPath) {
        this.proxyPath = proxyPath;
    }
}
