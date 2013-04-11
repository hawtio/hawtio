package io.hawt.camel;

import io.hawt.camel.schema.EndpointMixin;
import io.hawt.jsonschema.SchemaLookup;
import org.apache.camel.CamelContext;
import org.apache.camel.Component;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.impl.DefaultEndpoint;
import org.apache.camel.util.CamelContextHelper;
import org.apache.camel.util.LoadPropertiesException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.SortedMap;

/**
 * A facade for Camel
 */
public class CamelFacade implements CamelFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(CamelFacade.class);

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private SchemaLookup schemaLookup;
    private boolean conciseErrors;

    public void init() throws Exception {
        // lets check if we have a config directory if not lets create one...
        // now lets expose the mbean...
        if (objectName == null) {
            objectName = new ObjectName("io.hawt.camel:type=CamelFacade");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        mBeanServer.registerMBean(this, objectName);
    }

    public void destroy() throws Exception {
        if (objectName != null && mBeanServer != null) {
            mBeanServer.unregisterMBean(objectName);
        }
    }

    @Override
    public String getCustomEndpointsJson() throws LoadPropertiesException {
        boolean first = true;
        StringBuilder builder = new StringBuilder();
        // TODO should we find a camel context in JMX first?
        CamelContext camelContext = new DefaultCamelContext();
        SortedMap<String,Properties> components = CamelContextHelper.findComponents(camelContext);
        Set<Map.Entry<String,Properties>> entries = components.entrySet();
        for (Map.Entry<String, Properties> entry : entries) {
            String key = entry.getKey();
            Properties value = entry.getValue();
            //System.out.println("Found " + key + " value " + value);
            Class<?> endpointClass = null;
            try {
                Component component = camelContext.getComponent(key);
                if (component != null) {
                    Class<? extends Component> componentClass = component.getClass();
                    //System.out.println("Found component key " + key + " class " + aClass.getName());

                    // now lets try to resolve the endpoint
                    endpointClass = findEndpointClass(key, component, componentClass);
                    if (endpointClass != null) {
                        System.out.println("Found endpoint schema " + key + " class " + endpointClass.getName());

                        SchemaLookup schemaLookup = getSchemaLookup();
                        String json = schemaLookup.getSchemaForClass(endpointClass);
                        if (json != null && json.length() > 0) {
                            if (first) {
                                first = false;
                            } else {
                                builder.append(",\n");
                            }
                            builder.append("\"");
                            builder.append(key);
                            builder.append("\": ");
                            builder.append(json);
                        } else {
                            LOG.warn("No JSON returned!");
                            System.out.println("No JSON returned!");
                        }
                    }
                }
            } catch (Throwable e) {
                String endpoint = (endpointClass != null) ? " class " + endpointClass.getName() : "";
                String msg = "Failed to resolve Camel component " + key + endpoint + ". Reason: " + e;
                if (conciseErrors) {
                    LOG.error(msg);
                } else {
                    LOG.error(msg, e);
                }
            }
        }
        return builder.toString();
    }

    public SchemaLookup getSchemaLookup() {
        if (schemaLookup == null) {
            schemaLookup = SchemaLookup.getSingleton();
            schemaLookup.getMapper().addMixInAnnotations(DefaultEndpoint.class, EndpointMixin.class);
        }
        return schemaLookup;
    }

    public void setSchemaLookup(SchemaLookup schemaLookup) {
        this.schemaLookup = schemaLookup;
    }

    /**
     * Attempt to resolve the class of the endpoint for the given component
     */
    protected Class<?> findEndpointClass(String key, Component component, Class<? extends Component> componentClass) {
        // TODO we should try discover a camel API on the component itself to answer this question
        // maybe even asking it for all the endpoint kinds it offers...

        String name = componentClass.getName();
        String text = "Component";
        int idx = name.lastIndexOf(text);
        if (idx > 0) {
            String endpointClassName = name.substring(0, idx) + "Endpoint";
            int lastIdx = idx += text.length();
            if (lastIdx < name.length()) {
                endpointClassName += name.substring(lastIdx);
            }
            try {
                return componentClass.getClassLoader().loadClass(endpointClassName);
            } catch (ClassNotFoundException e) {
                LOG.debug("Could not find endpoint class " + endpointClassName + " when trying to find endpoint class for component " + name);
            }
        }
        return null;
    }

    public boolean isConciseErrors() {
        return conciseErrors;
    }

    public void setConciseErrors(boolean conciseErrors) {
        this.conciseErrors = conciseErrors;
    }
}