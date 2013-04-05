package io.hawt.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.osgi.framework.BundleContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;

/**
 * @author Stan Lewis
 */
public class SchemaLookup implements SchemaLookupMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(SchemaLookup.class);

    private MBeanServer mBeanServer;
    private ObjectName objectName;

    private ObjectMapper mapper;
    private BundleContext context = null;

    public SchemaLookup() {
        this.init();
    }

    public SchemaLookup(BundleContext context) {
        this.context = context;
        this.init();
    }

    public void init() {
        LOG.debug("Creating hawtio SchemaLookup instance");
        try {
            if (mapper == null) {
                mapper = new ObjectMapper();
            }
            // now lets expose the mbean...
            if (objectName == null) {
                objectName = new ObjectName("io.hawt.jsonschema:type=SchemaLookup");
            }
            if (mBeanServer == null) {
                mBeanServer = ManagementFactory.getPlatformMBeanServer();
            }
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                LOG.info("Re-registering SchemaLookup MBean");
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception during initialization: ", e);
            throw new RuntimeException(e);
        }
    }

    public void destroy() {
        try {
            if (objectName != null && mBeanServer != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception unregistering mbean: ", e);
            throw new RuntimeException(e);
        }
    }

    private Class getClass(String name) {
        // TODO - well, this relies on DynamicImport-Package to work, but seems simpler than mucking about with org.osgi.framework.wiring
        try {
            return Class.forName(name);
        } catch (ClassNotFoundException e) {
            LOG.warn("Failed to find class for {}", name);
            throw new RuntimeException(e);
        }
    }


    @Override
    public String getSchemaForClass(String name) {
        Class clazz = getClass(name);
        try {
            ObjectWriter writer = mapper.writer().withDefaultPrettyPrinter();
            return writer.writeValueAsString(mapper.generateJsonSchema(clazz));
        } catch (Exception e) {
            LOG.warn("Failed to generate JSON schema for class {}", name, e);
            throw new RuntimeException(e);
        }
    }
}
