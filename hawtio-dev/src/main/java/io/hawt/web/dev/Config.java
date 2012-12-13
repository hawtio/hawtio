package io.hawt.web.dev;

import org.apache.log4j.Logger;

/**
 * @author Stan Lewis
 */
public class Config {

    static private Config _instance = null;

    static private final Logger LOG = Logger.getLogger(Config.class);

    private String contentDirectory = null;

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

}
