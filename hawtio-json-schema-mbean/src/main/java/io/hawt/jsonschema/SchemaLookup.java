package io.hawt.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;
import com.fasterxml.jackson.module.jsonSchema.JsonSchema;
import com.fasterxml.jackson.module.jsonSchema.factories.SchemaFactoryWrapper;
import io.hawt.jsonschema.internal.customizers.JsonSchemaCustomizer;
import io.hawt.util.MBeanSupport;
import io.hawt.jsonschema.internal.BeanValidationAnnotationModule;
import io.hawt.jsonschema.internal.IgnorePropertiesBackedByTransientFields;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SchemaLookup extends MBeanSupport implements SchemaLookupMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(SchemaLookup.class);

    private static SchemaLookup singleton;

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
            super.init();
            singleton = this;
        } catch (Exception e) {
            LOG.warn("Exception during initialization: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=SchemaLookup";
    }

    protected Class<?> getClass(String name) {
        BundleContext bundleContext = null;
        Bundle currentBundle = FrameworkUtil.getBundle(getClass());
        if (currentBundle != null) {
            bundleContext = currentBundle.getBundleContext();
        }
        if (bundleContext != null) {
            Bundle[] bundles = bundleContext.getBundles();
            for (Bundle bundle : bundles) {
                if (bundle.getState() >= Bundle.RESOLVED) {
                    try {
                        return bundle.loadClass(name);
                    } catch (ClassNotFoundException e) {
                        // Ignore
                    }
                }
            }
        } else {
            try {
                return Class.forName(name);
            } catch (ClassNotFoundException e) {
                LOG.warn("Failed to find class for {}", name);
                throw new RuntimeException(e);
            }
        }
        LOG.warn("Failed to find class for {}", name);
        throw new RuntimeException(new ClassNotFoundException(name));
    }

    @Override
    public String getSchemaForClass(String name) {
        Class<?> clazz = getClass(name);
        return getSchemaForClass(clazz);
    }

    public String getSchemaForClass(Class<?> clazz) {
        LOG.debug("Looking up schema for {}", clazz.getCanonicalName());
        String name = clazz.getName();
        try {
            ObjectWriter writer = mapper.writer().withDefaultPrettyPrinter();
            SchemaFactoryWrapper schemaFactoryWrapper = new SchemaFactoryWrapper();
            mapper.acceptJsonFormatVisitor(mapper.constructType(clazz), schemaFactoryWrapper);
            com.fasterxml.jackson.module.jsonSchema.JsonSchema jsonSchema = schemaFactoryWrapper.finalSchema();
            customizeSchema(clazz, jsonSchema);
            return writer.writeValueAsString(jsonSchema);
        } catch (Exception e) {
            LOG.warn("Failed to generate JSON schema for class " + name, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * If there's schema customizer, use it to alter generated schema.
     * Customizer is looked in io.hawt.jsonschema.internal.customizers.&lt;fullClazzName&gt;SchemaCustomizer class
     *
     * @param clazz
     * @param jsonSchema
     * @return
     */
    private JsonSchema customizeSchema(Class<?> clazz, JsonSchema jsonSchema) {
        String customizerClassName = String.format("%s.internal.customizers.%sSchemaCustomizer", getClass().getPackage().getName(), clazz.getName());
        try {
            Class<?> customizerClass = getClass(customizerClassName);
            return ((JsonSchemaCustomizer)customizerClass.newInstance()).customize(jsonSchema);
        } catch (Exception ignored) {
            return jsonSchema;
        }
    }

    public ObjectMapper getMapper() {
        return mapper;
    }

    public void setMapper(ObjectMapper mapper) {
        this.mapper = mapper;
    }
}
