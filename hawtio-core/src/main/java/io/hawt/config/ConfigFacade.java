package io.hawt.config;

import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.io.InputStream;
import java.lang.management.ManagementFactory;
import java.util.Properties;

/**
 * A facade for the hawtio configuration features.
 */
public class ConfigFacade implements ConfigFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(ConfigFacade.class);
    private static ConfigFacade singleton;

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private String configDir;
    private String version;
    private boolean registered;

    public static ConfigFacade getSingleton() {
        if (singleton == null) {
            LOG.warn("No ConfigFacade constructed yet so using default configuration for now");
            singleton = new ConfigFacade();
        }
        return singleton;
    }

    public void init() throws Exception {
        singleton = this;

        // lets check if we have a config directory if not lets create one...
        // now lets expose the mbean...
        if (objectName == null) {
            objectName = new ObjectName(getDefaultObjectName());
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        if (!registered && !mBeanServer.isRegistered(objectName)) {
            mBeanServer.registerMBean(this, objectName);
            registered = true;
        }
    }

    public void destroy() throws Exception {
        if (registered && objectName != null && mBeanServer != null) {
            registered = false;
            mBeanServer.unregisterMBean(objectName);
        }
    }

    protected String getDefaultObjectName() {
        return "io.hawt.config:type=ConfigFacade";
    }

    @Override
    public String getVersion() {
        if (version == null) {
            // lets try find the maven property - as the Java API rarely works :)
            InputStream is = null;
            String fileName = "/META-INF/maven/io.hawt/hawtio-core/pom.properties";
            // try to load from maven properties first
            try {
                Properties p = new Properties();
                is = getClass().getResourceAsStream(fileName);
                if (is != null) {
                    p.load(is);
                    version = p.getProperty("version", "");
                }
            } catch (Exception e) {
                // ignore
            } finally {
                if (is != null) {
                    IOHelper.close(is, fileName, LOG);
                }
            }
        }
        if (version == null) {
            Package aPackage = getClass().getPackage();
            if (aPackage != null) {
                version = aPackage.getImplementationVersion();
                if (Strings.isBlank(version)) {
                    version = aPackage.getSpecificationVersion();
                }
            }
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

    public MBeanServer getMBeanServer() {
        return mBeanServer;
    }

    public void setMBeanServer(MBeanServer mBeanServer) {
        this.mBeanServer = mBeanServer;
    }

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
    }
}