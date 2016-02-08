package io.hawt.config;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import io.hawt.util.MBeanSupport;
import io.hawt.util.Objects;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A facade for the hawtio configuration features.
 */
public class ConfigFacade extends MBeanSupport implements ConfigFacadeMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(ConfigFacade.class);
    private static ConfigFacade singleton;

    private static Map<String, URLHandler> urlStreamHandlerMap = new ConcurrentHashMap<String, URLHandler>();
    private String configDir;
    private String version;

    public static ConfigFacade getSingleton() {
        if (singleton == null) {
            LOG.debug("No ConfigFacade constructed yet so using default configuration for now");
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
            version = Objects.getVersion(getClass(), "io.hawt", "hawtio-core");
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
            configDir = home + System.getProperty("hawtio.dirname", "/.hawtio");
        }
        return configDir;
    }

    public void setConfigDir(String configDir) {
        this.configDir = configDir;
    }

    public boolean isOffline() {
        return "true".equals(System.getProperty("hawtio.offline", "false"));
    }

    public InputStream openURL(String url) throws IOException {
        int idx = url.indexOf(':');
        if (idx > 1) {
            String protocol = url.substring(0, idx);
            String path = url.substring(idx + 1);
            URLHandler urlHandler = getUrlHandler(protocol);
            if (urlHandler != null) {
                return urlHandler.openStream(path);
            }
        }
        return new URL(url).openStream();
    }

    public URLHandler getUrlHandler(String protocol) {
        return urlStreamHandlerMap.get(protocol);
    }

    public void addUrlHandler(String protocol, URLHandler handler) {
        urlStreamHandlerMap.put(protocol, handler);
    }

    public void removeUrlHandler(String protocol) {
        urlStreamHandlerMap.remove(protocol);
    }

}