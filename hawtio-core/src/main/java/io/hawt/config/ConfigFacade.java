package io.hawt.config;

import io.hawt.util.MBeanSupport;
import io.hawt.util.Objects;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * A facade for the hawtio configuration features.
 */
public class ConfigFacade extends MBeanSupport implements ConfigFacadeMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(ConfigFacade.class);
    private static ConfigFacade singleton;

    private String configDir;
    private String version;

    public static ConfigFacade getSingleton() {
        if (singleton == null) {
            LOG.warn("No ConfigFacade constructed yet so using default configuration for now");
            singleton = new ConfigFacade();
        }
        return singleton;
    }

    @Override
    public void init() throws Exception {
        ConfigFacade.singleton = this;
        super.init();
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=ConfigFacade";
    }

    @Override
    public String getVersion() {
        if (version == null) {
            version = Objects.getVersion(getClass(),"io.hawt",  "hawtio-core");
        }
        return version;
    }

    /**
     * Returns the configuration directory; lazily attempting to create it if it does not yet exist
     */
    public File getConfigDirectory() {
        String dirName = getConfigDir();
        File answer = null;
        if (Strings.isNotBlank(dirName)) {
            answer = new File(dirName);
        } else {
            answer = new File(".hawtio");
        }
        answer.mkdirs();
        return answer;
    }

    @Override
    public String getConfigDir() {
        if (Strings.isBlank(configDir)) {
            // lets default to the users home directory
            String home = System.getProperty("user.home", "~");
            configDir = home + "/.hawtio";
        }
        return configDir;
    }

    public void setConfigDir(String configDir) {
        this.configDir = configDir;
    }

    public boolean isOffline() {
        return "true".equals(System.getProperty("hawtio.offline", "false"));
    }

}