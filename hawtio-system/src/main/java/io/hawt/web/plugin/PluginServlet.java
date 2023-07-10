package io.hawt.web.plugin;

import java.beans.Introspector;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.management.ManagementFactory;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import javax.management.Attribute;
import javax.management.AttributeList;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;
import javax.management.ReflectionException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.web.ServletHelpers;
import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Plugin servlet
 */
public class PluginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(PluginServlet.class);

    private static final String[] PLUGIN_ATTRIBUTES = {
        "Url",
        "Scope",
        "Module",
        "RemoteEntryFileName",
        "BustRemoteEntryCache",
        "PluginEntry"
    };
    private static final String[] MANDATORY_PLUGIN_ATTRIBUTES = {
        "Url",
        "Scope",
        "Module"
    };

    private MBeanServer mBeanServer;
    private ObjectName pluginQuery;
    private final Converters converters = new Converters();
    private final JsonConvertOptions options = JsonConvertOptions.DEFAULT;

    @Override
    public void init() throws ServletException {
        mBeanServer = ManagementFactory.getPlatformMBeanServer();
        try {
            pluginQuery = new ObjectName("hawtio:type=plugin,name=*");
        } catch (MalformedObjectNameException e) {
            LOG.warn("Failed to create object name:", e);
        }
        super.init();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        final PrintWriter out = response.getWriter();

        Set<ObjectInstance> plugins = mBeanServer.queryMBeans(pluginQuery, null);

        List<Map<String, Object>> answer = plugins.stream()
            .map(plugin -> {
                AttributeList attributeList = null;
                try {
                    attributeList = mBeanServer.getAttributes(plugin.getObjectName(), PLUGIN_ATTRIBUTES);
                } catch (InstanceNotFoundException e) {
                    LOG.warn("Object instance not found: " + plugin.getObjectName(), e);
                } catch (ReflectionException e) {
                    LOG.warn("Failed to get attribute list for mbean: " + plugin.getObjectName(), e);
                } catch (SecurityException e) {
                    LOG.warn("Security issue accessing mbean: " + plugin.getObjectName(), e);
                }

                if (attributeList == null || !isPluginMBean(attributeList)) {
                    return null;
                }
                return attributeList.asList().stream()
                    .filter(a -> Objects.nonNull(a.getValue()))
                    .collect(Collectors.toMap(
                        a -> Introspector.decapitalize(a.getName()),
                        Attribute::getValue));
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        ServletHelpers.writeObject(converters, options, out, answer);
    }

    private boolean isPluginMBean(AttributeList attributeList) {
        if (attributeList.size() < MANDATORY_PLUGIN_ATTRIBUTES.length) {
            return false;
        }

        return attributeList.asList().stream()
            .map(Attribute::getName).collect(Collectors.toSet())
            .containsAll(Arrays.asList(MANDATORY_PLUGIN_ATTRIBUTES));
    }
}
