package io.hawt.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;
import io.hawt.jsonschema.internal.BeanValidationAnnotationModule;
import io.hawt.jsonschema.internal.IgnorePropertiesBackedByTransientFields;
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

    private static SchemaLookup singleton;

    private MBeanServer mBeanServer;
    private ObjectName objectName;

    private ObjectMapper mapper;

    public SchemaLookup() {
    }

    public static SchemaLookup getSingleton() {
        if (singleton == null) {
            // lazy create one
            new SchemaLookup().init();
        }
        return singleton;
    }

    public void init() {
        LOG.debug("Creating hawtio SchemaLookup instance");
        try {
            if (mapper == null) {
                mapper = new ObjectMapper();

                mapper.setVisibilityChecker(new IgnorePropertiesBackedByTransientFields(mapper.getVisibilityChecker()));

                JaxbAnnotationModule module1 = new JaxbAnnotationModule();
                mapper.registerModule(module1);

                BeanValidationAnnotationModule module2 = new BeanValidationAnnotationModule();
                mapper.registerModule(module2);

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
            singleton = this;
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

    protected Class getClass(String name) {
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
        return getSchemaForClass(clazz);
    }

    public String getSchemaForClass(Class clazz) {
        LOG.info("Looking up schema for " + clazz.getCanonicalName());
        String name = clazz.getName();
        try {
            ObjectWriter writer = mapper.writer().withDefaultPrettyPrinter();
            return writer.writeValueAsString(mapper.generateJsonSchema(clazz));
        } catch (Exception e) {
            LOG.warn("Failed to generate JSON schema for class {}", name, e);
            throw new RuntimeException(e);
        }
    }

    public ObjectMapper getMapper() {
        return mapper;
    }

    public void setMapper(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public MBeanServer getmBeanServer() {
        return mBeanServer;
    }

    public void setmBeanServer(MBeanServer mBeanServer) {
        this.mBeanServer = mBeanServer;
    }

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
    }
}
