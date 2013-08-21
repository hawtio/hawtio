package io.hawt.web;

import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.*;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.management.ManagementFactory;
import java.util.*;

/**
 * @author Stan Lewis
 */
public class PluginServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(PluginServlet.class);

    MBeanServer mBeanServer;
    ObjectName pluginQuery;
    Converters converters = new Converters();
    JsonConvertOptions options = JsonConvertOptions.DEFAULT;

    String attributes[] = { "Context", "Domain", "Name", "Scripts" };

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

    private void writeEmpty(PrintWriter out) {
        out.write("{}");
        out.flush();
        out.close();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        final PrintWriter out = response.getWriter();

        Set<ObjectInstance> objectInstances = mBeanServer.queryMBeans(pluginQuery, null);

        if (objectInstances.size() == 0) {
            writeEmpty(out);
            return;

        }

        Map<String, Map<Object, Object>> answer = new HashMap<String, Map<Object, Object>>();

        for (ObjectInstance objectInstance : objectInstances) {

            AttributeList attributeList = null;

            try {
                attributeList = mBeanServer.getAttributes(objectInstance.getObjectName(), attributes);
            } catch (InstanceNotFoundException e) {
                LOG.warn("Object instance not found: ", e);
            } catch (ReflectionException e) {
                LOG.warn("Failed to get attribute list for " + objectInstance.getObjectName(), e);
            }

            if (attributeList != null && attributes.length == attributeList.size()) {

                Map<Object, Object> pluginDefinition = new HashMap<Object, Object>();

                for (Attribute attribute : attributeList.asList()) {
                    pluginDefinition.put(attribute.getName(), attribute.getValue());
                }
                answer.put((String)pluginDefinition.get("Name"), pluginDefinition);
            }

            Object result = null;

            try {
                result = converters.getToJsonConverter().convertToJson(answer, null, options);
            } catch (AttributeNotFoundException e) {
                LOG.warn("Failed to convert plugin list to json", e);
            }

            if (result != null) {
                out.write(result.toString());
                out.flush();
                out.close();
            } else {
                writeEmpty(out);
            }
        }
    }
}
