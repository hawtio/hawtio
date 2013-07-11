package io.hawt.introspect;

import io.hawt.util.MBeanSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.beans.BeanInfo;
import java.beans.PropertyDescriptor;
import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;

/**
 * A helper bean for working with the introspector.
 */
public class Introspector extends MBeanSupport implements IntrospectorMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(Introspector.class);
    private static Introspector singleton;

    private String configDir;
    private String version;
    private ClassScanner classScanner = new ClassScanner();

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

    /**
     * Searches for the available class names given the text search
     *
     * @return all the class names found on the current classpath using the given text search filter
     */
    public SortedSet<String> findClassNames(String search, Integer limit) {
        return getClassScanner().findClassNames(search, limit);
    }


    /**
     * Returns a list of properties for the given type name
     */
    public List<PropertyDTO> getProperties(String className) throws Exception {
        List<PropertyDTO> answer = new ArrayList<PropertyDTO>();
        Class<?> aClass = getClassScanner().findClass(className);
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

    public ClassScanner getClassScanner() {
        return classScanner;
    }

    public void setClassScanner(ClassScanner classScanner) {
        this.classScanner = classScanner;
    }

}