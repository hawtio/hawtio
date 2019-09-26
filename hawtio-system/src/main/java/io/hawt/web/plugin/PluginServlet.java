package io.hawt.web.plugin;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import javax.management.AttributeList;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;
import javax.management.ReflectionException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
    private static final transient Logger LOG = LoggerFactory.getLogger(PluginServlet.class);

    private static final String[] ATTRIBUTES = { "Context", "Domain", "Name", "Scripts" };

    private MBeanServer mBeanServer;
    private ObjectName pluginQuery;
    private Converters converters = new Converters();
    private JsonConvertOptions options = JsonConvertOptions.DEFAULT;

    @Override
    public void init() throws ServletException {
        mBeanServer = ManagementFactory.getPlatformMBeanServer();
        try {
            pluginQuery = new ObjectName("hawtio:type=plugin,name=*");
        } catch (MalformedObjectNameException e) {
            LOG.warn("Failed to create object name: ", e);
        }
        super.init();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setContentType("application/json");
        final PrintWriter out = response.getWriter();

        Set<ObjectInstance> objectInstances = mBeanServer.queryMBeans(pluginQuery, null);

        if (objectInstances.isEmpty()) {
            ServletHelpers.writeEmpty(out);
            return;
        }

        Map<String, Map<Object, Object>> answer = new HashMap<>();

        for (ObjectInstance objectInstance : objectInstances) {

            AttributeList attributeList = null;

            try {
                attributeList = mBeanServer.getAttributes(objectInstance.getObjectName(), ATTRIBUTES);
            } catch (InstanceNotFoundException e) {
                LOG.warn("Object instance not found: " + objectInstance.getObjectName(), e);
            } catch (ReflectionException e) {
                LOG.warn("Failed to get attribute list for mbean: " + objectInstance.getObjectName(), e);
            } catch (SecurityException e) {
                LOG.warn("Security issue accessing mbean: " + objectInstance.getObjectName(), e);
            }

            if (attributeList != null && ATTRIBUTES.length == attributeList.size()) {
                Map<Object, Object> pluginDefinition = new HashMap<>();
                attributeList.asList().forEach(
                    attr -> pluginDefinition.put(attr.getName(), attr.getValue()));
                answer.put((String) pluginDefinition.get("Name"), pluginDefinition);
            }

        }
        ServletHelpers.writeObject(converters, options, out, answer);
    }

}
