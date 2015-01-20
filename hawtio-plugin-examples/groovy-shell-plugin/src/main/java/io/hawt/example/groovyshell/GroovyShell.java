package io.hawt.example.groovyshell;

import java.lang.management.ManagementFactory;
import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GroovyShell implements GroovyShellMBean {

    private static final Logger LOG = LoggerFactory.getLogger(GroovyShell.class);
    private MBeanServer mBeanServer;
    private ObjectName objectName;
    private groovy.lang.GroovyShell shell;

    public GroovyShell() {
        shell = new groovy.lang.GroovyShell();
    }

    public void init() {
        if (objectName == null) {
            try {
                objectName = getObjectName();
            } catch (Exception e) {
                LOG.warn("Failed to create object name: ", e);
                throw new RuntimeException("Failed to create object name: ", e);
            }
        }

        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }

        if (mBeanServer != null) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch(InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                try {
                    mBeanServer.unregisterMBean(objectName);
                    mBeanServer.registerMBean(this, objectName);
                } catch (Exception e) {
                    LOG.warn("Failed to register mbean: ", e);
                    throw new RuntimeException("Failed to register mbean: ", e);
                }
            } catch (Exception e) {
                LOG.warn("Failed to register mbean: ", e);
                throw new RuntimeException("Failed to register mbean: ", e);
            }
        }

    }

    public void destroy() {
        if (mBeanServer != null && objectName != null) {
            try {
                mBeanServer.unregisterMBean(objectName);
            } catch (Exception e) {
                LOG.warn("Failed to unregister mbean: ", e);
                throw new RuntimeException("Failed to unregister mbean: ", e);
            }
        }
    }

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("hawtio:type=GroovyShell");
    }

    @Override
    public String evaluate(String input) {
        Object out = shell.evaluate(input);
        if (out != null) {
            return out.toString();
        } else {
            return "[null]";
        }
    }
}
