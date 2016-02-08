package io.hawt.web;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A servlet for returning the javadoc files for a given set of maven coordinates and file paths
 */
public class JavaDocServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private MBeanServer mbeanServer;
    private ObjectName objectName;
    private String[] argumentTypes = {"java.lang.String", "java.lang.String"};

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);

        try {
            if (mbeanServer == null) {
                mbeanServer = ManagementFactory.getPlatformMBeanServer();
            }
            if (objectName == null) {
                objectName = new ObjectName("io.fabric8.insight:type=LogQuery");
            }
        } catch (MalformedObjectNameException e) {
            throw new ServletException("Failed to initialise LogQuery MBean: " + e, e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (mbeanServer != null && objectName != null) {
            while (pathInfo.startsWith("/")) {
                pathInfo = pathInfo.substring(1);
            }
            int idx = pathInfo.indexOf('/');
            if (idx > 0) {
                String mavenCoords = pathInfo.substring(0, idx);
                String path = pathInfo.substring(idx + 1);
                if (path == null || path.trim().length() == 0) {
                    path = "index.html";
                }
                Object[] arguments = {mavenCoords, path};
                try {
                    Object answer = mbeanServer.invoke(objectName, "getJavaDoc", arguments, argumentTypes);
                    if (answer instanceof String) {
                        if (!pathInfo.endsWith(".css")) {
                            resp.setContentType("text/html;charset=utf-8");
                        }
                        resp.getWriter().println(answer);
                    }
                } catch (Exception e) {
                    throw new ServletException("Failed to find javadoc from maven coordinates " + mavenCoords + " path " + path + ". Reason " + e, e);
                }
            }
        }
    }
}
