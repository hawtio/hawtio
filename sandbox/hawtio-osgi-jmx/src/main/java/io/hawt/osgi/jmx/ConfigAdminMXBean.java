package io.hawt.osgi.jmx;

import java.util.Map;

/**
 * This MXBean is to get around a limitation in Jolokia (1.1.2) which prevents it
 * from working with JMX APIs that take a TabularData argument such as
 * {@code ConfigurationAdminMBean.html.update(String pid, TabularData properties)}.
 */
public interface ConfigAdminMXBean {
    void configAdminUpdate(String pid, Map<String, String> data);
}
