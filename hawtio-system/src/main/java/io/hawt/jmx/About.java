package io.hawt.jmx;

import java.io.InputStream;
import java.lang.management.ManagementFactory;
import java.util.Properties;
import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

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
            } catch(InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
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
        return doGetHawtioVersion();
    }

    private synchronized String doGetHawtioVersion() {
        if (hawtioVersion != null) {
            return hawtioVersion;
        }

        InputStream is = null;
        try {
            Properties p = new Properties();

            // try loading from manifest first
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/MANIFEST.MF");
            if (is == null) {
                // then try to load from maven properties first
                is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/maven/io.hawt/hawtio-web/pom.properties");
            }
            if (is == null) {
                // then try to load from maven properties first
                is = Thread.currentThread().getContextClassLoader().getResourceAsStream("/META-INF/maven/io.hawt/hawtio-default/pom.properties");
            }
            if (is != null) {
                p.load(is);
                hawtioVersion = p.getProperty("Bundle-Version", null);
                if (hawtioVersion == null) {
                    hawtioVersion = p.getProperty("version", "");
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
        if (hawtioVersion == null) {
            Package aPackage = Thread.currentThread().getContextClassLoader().getClass().getPackage();
            if (aPackage != null) {
                hawtioVersion = aPackage.getImplementationVersion();
                if (hawtioVersion == null) {
                    hawtioVersion = aPackage.getSpecificationVersion();
                }
            }
        }

        if (hawtioVersion == null) {
            // we could not compute the version so use a blank
            hawtioVersion = "";
        }

        return hawtioVersion;
    }

}
