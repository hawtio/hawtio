package io.hawt.jmx;

import java.io.InputStream;
import java.lang.management.ManagementFactory;
import java.util.Properties;
import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import io.hawt.util.Objects;

public class About implements AboutMBean {

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private String hawtioVersion;

    public void init() throws Exception {
        if (objectName == null) {
            objectName = getObjectName();
        }

        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }

        if (mBeanServer != null) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }

            // try to compute hawtio version once on startup
            try {
                hawtioVersion = doGetHawtioVersion();
            } catch (Exception e) {
                // ignore
            }
        }
    }

    public void destroy() throws Exception {
        if (mBeanServer != null) {
            if (objectName != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        }
    }

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("hawtio:type=About");
    }

    @Override
    public String getHawtioVersion() {
        if (hawtioVersion != null) {
            return hawtioVersion;
        }
        return doGetHawtioVersion();
    }

    private synchronized String doGetHawtioVersion() {
        // loading the version can be tricky depending on how hawtio has been started, so we try different strategies

        String version = Objects.getVersion(getClass(), "io.hawt", "hawtio-web");
        if (version == null) {
            version = Objects.getVersion(getClass(), "io.hawt", "hawtio-app");
        }
        if (version == null) {
            version = Objects.getVersion(getClass(), "io.hawt", "hawtio-default");
        }
        if (version != null) {
            return version;
        }

        InputStream is = null;
        try {
            Properties p = new Properties();

            // try to load from maven properties first as they have the version
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/maven/io.hawt/hawtio-web/pom.properties");
            if (is == null) {
                is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/maven/io.hawt/hawtio-default/pom.properties");
            }
            if (is == null) {
                is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/maven/io.hawt/hawtio-app/pom.properties");
            }
            if (is == null) {
                is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/maven/io.hawt/hawtio-embedded/pom.properties");
            }
            // then try the general manifest file
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/MANIFEST.MF");
            if (is != null) {
                p.load(is);
                version = p.getProperty("Bundle-Version", null);
                if (version == null) {
                    version = p.getProperty("version", "");
                }
            }
        } catch (Exception e) {
            // ignore
            e.printStackTrace();
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (Exception e) {
                    // ignore
                }
            }
        }

        // fallback to using Java API
        if (version == null) {
            Package aPackage = Thread.currentThread().getContextClassLoader().getClass().getPackage();
            if (aPackage != null) {
                version = aPackage.getImplementationVersion();
                if (version == null) {
                    version = aPackage.getSpecificationVersion();
                }
            }
        }

        if (version == null) {
            // we could not compute the version so use a blank
            version = "";
        }

        return version;
    }

}
