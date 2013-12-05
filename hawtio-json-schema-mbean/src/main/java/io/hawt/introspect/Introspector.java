package io.hawt.introspect;

import io.hawt.introspect.support.ClassScanner;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.beans.BeanInfo;
import java.beans.PropertyDescriptor;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;

/**
 * A helper bean for working with the introspector.
 */
public class Introspector extends MBeanSupport implements IntrospectorMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(Introspector.class);
    private static Introspector singleton;

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
        // lets force a preload of the class name cache
        findClassNames("", null);
        super.init();

    }

    @Override
    protected String getDefaultObjectName() {
        return "io.hawt.introspect:type=Introspector";
    }

    /**
     * Registers a named class loader provider or removes it if the classLoaderProvider is null
     */
    public void setClassLoaderProvider(String id, ClassLoaderProvider classLoaderProvider) {
        classScanner.setClassLoaderProvider(id, classLoaderProvider);
    }


    /**
     * Searches for the available class names given the text search
     *
     * @return all the class names found on the current classpath using the given text search filter
     */
    public SortedSet<String> findClassNames(String search, Integer limit) {
        return getClassScanner().findClassNames(search, limit);
    }

    @Override
    public SortedSet<String> findClassNamesMethodsAnnotatedWith(String annotationClassName) {
        return getClassScanner().findClassNamesMethodsAnnotatedWith(annotationClassName);
    }

    @Override
    public SortedSet<String> findJUnitTestClassNames() {
        return findClassNamesMethodsAnnotatedWith("org.junit.Test");
    }

    /**
     * Returns a list of properties for the given type name
     */
    public List<PropertyDTO> getProperties(String className) throws Exception {
        Class<?> aClass = getClassScanner().findClass(className);
        return getProperties(aClass);
    }

    public List<PropertyDTO> getProperties(Class<?> aClass) throws Exception {
        List<PropertyDTO> answer = new ArrayList<PropertyDTO>();
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

    /**
     * Returns a list of properties available; supporting the navigation using dot of properties into
     * nested properties
     */
    public List<PropertyDTO> findProperties(String className, String filter) throws Exception {
        List<PropertyDTO> properties = getProperties(className);
        if (Strings.isNotBlank(filter)) {
            String[] propertyPaths = filter.split("\\.");
            String firstPrefix = "";
            PropertyDTO lastNavigation = null;
            // lets try find the first property type and keep navigating
            int idx = 0;
            StringBuilder prefixBuilder = new StringBuilder();
            for (String propertyPath : propertyPaths) {
                PropertyDTO property = Introspections.findPropertyByName(properties, propertyPath);
                boolean last = ++idx == propertyPaths.length;
                if (property == null) {
                    // if we're the last path don't worry, just filter the results
                    break;
                } else {
                    lastNavigation = property;
                    List<PropertyDTO> childProperties = getProperties(property.getTypeClass());
                    if (childProperties.size() > 0) {
                        properties = childProperties;
                    } else {
                        // lets not iterate any more as we've no more properties
                        break;
                    }
                }
                firstPrefix = prefixBuilder.toString();
                prefixBuilder.append(propertyPath);
                prefixBuilder.append(".");
            }
            if (lastNavigation != null) {
                // lets add the last parent object too just in case
                List<PropertyDTO> answer = new ArrayList<PropertyDTO>();
                answer.add(lastNavigation);
                answer.addAll(properties);

                // now add the successful path navigations to the path
                String nestedPrefix = prefixBuilder.toString();
                String prefix = firstPrefix;
                for (PropertyDTO dto : answer) {
                    dto.setName(prefix + dto.getName());
                    prefix = nestedPrefix;
                }
                return answer;
            }
        }
        return properties;
    }

    @Override
    public void clearCache() {
        getClassScanner().clearCache();
    }

    public ClassScanner getClassScanner() {
        return classScanner;
    }

    public void setClassScanner(ClassScanner classScanner) {
        this.classScanner = classScanner;
    }

}