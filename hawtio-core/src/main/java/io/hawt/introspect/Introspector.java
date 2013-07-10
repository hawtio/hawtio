package io.hawt.introspect;

import io.hawt.util.MBeanSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.beans.BeanInfo;
import java.beans.PropertyDescriptor;
import java.util.ArrayList;
import java.util.List;

/**
 * A helper bean for working with the introspector.
 */
public class Introspector extends MBeanSupport implements IntrospectorMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(Introspector.class);
    private static Introspector singleton;

    private String configDir;
    private String version;

    public static Introspector getSingleton() {
        if (singleton == null) {
            LOG.warn("No Introspector constructed yet so using default configuration for now");
            singleton = new Introspector();
        }
        return singleton;
    }

    @Override
    public void init() throws Exception {
        Introspector.singleton = this;
        super.init();

    }

    @Override
    protected String getDefaultObjectName() {
        return "io.hawt.introspect:type=Introspector";
    }

    public List<String> getClassNames(String search) {
        // lets find all class names that contain the given search string...
        List<String> answer = new ArrayList<String>();
        // TODO use some scanner thingy to find the available packages...
        return answer;
    }


    /**
     * Returns a list of properties for the given type name
     */
    public List<PropertyDTO> getProperties(String className) throws Exception {
        List<PropertyDTO> answer = new ArrayList<PropertyDTO>();
        Class<?> aClass = findClass(className);
        if (aClass != null) {
            BeanInfo beanInfo = java.beans.Introspector.getBeanInfo(aClass);
            PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
            for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
                // ignore the class property
                if (propertyDescriptor.getName().equals("class")) {
                    continue;
                }
                PropertyDTO info = new PropertyDTO(propertyDescriptor);
                answer.add(info);
            }
        }
        return answer;
    }

    protected Class<?> findClass(String className) throws ClassNotFoundException {
        // TODO we need an OSGI version of this!!!
        try {
            return Thread.currentThread().getContextClassLoader().loadClass(className);
        } catch (ClassNotFoundException e) {
            try {
                return getClass().getClassLoader().loadClass(className);
            } catch (ClassNotFoundException e2) {
                return Class.forName(className);
            }
        }
    }

}