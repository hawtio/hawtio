package io.hawt.web;

import org.jolokia.config.ConfigKey;
import org.jolokia.http.AgentServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.util.Enumeration;
import java.util.Hashtable;

/**
 * Decorator class around Jolokia native AgentServlet.
 * <p>
 * Adds support to specify Jolokia agent configurable parameters via java system properties mechanism.
 * This allows to provide start up time customization, without the need to alter web.xml deployment descriptor.
 * <p>
 * To specify them, you need to pass the to the jvm process with "jolokia." prefix.
 * <p>
 * Ex.
 * -Djolokia.policyLocation=file:///home/fuse/my-access.xml'
 * <p>
 * The supported input configuration is described in Jolokia documentation:
 * <p>
 * https://jolokia.org/reference/html/agents.html#agent-war-init-params
 */
public class JolokiaConfiguredAgentServlet extends AgentServlet {
    private static final transient Logger LOG = LoggerFactory.getLogger(JolokiaConfiguredAgentServlet.class);

    @Override
    public void init(ServletConfig pServletConfig) throws ServletException {

        String policyLocation = System.getProperty("jolokia." + ConfigKey.POLICY_LOCATION.toString());
        if (policyLocation != null) {
            LOG.info("Jolokia will load jolokia-access.xml from [" + policyLocation + "]");
            ServletConfigWrapper pServletConfigWrapper = new ServletConfigWrapper(pServletConfig);
            pServletConfigWrapper.addProperty(ConfigKey.POLICY_LOCATION.toString(), policyLocation);
            super.init(pServletConfigWrapper);

        } else {
            LOG.info("Using Jolokia default configuration values.");
            super.init(pServletConfig);
        }

    }

    class ServletConfigWrapper implements ServletConfig {
        ServletConfig wrapped;
        Hashtable<String, String> ownProps;

        public ServletConfigWrapper(ServletConfig pServletConfig) {
            wrapped = pServletConfig;
            ownProps = new Hashtable<>();
        }

        @Override
        public String getServletName() {
            return wrapped.getServletName();
        }

        @Override
        public ServletContext getServletContext() {
            return wrapped.getServletContext();
        }

        @Override
        public String getInitParameter(String s) {
            if (ownProps.containsKey(s)) {
                return ownProps.get(s);
            }
            return wrapped.getInitParameter(s);
        }

        @Override
        public Enumeration getInitParameterNames() {
            return new TwoEnumerationsWrapper(ownProps.keys(), wrapped.getInitParameterNames());
        }

        public void addProperty(String key, String value) {
            ownProps.put(key, value);
        }
    }

    class TwoEnumerationsWrapper implements Enumeration<String> {
        Enumeration<String> a;
        Enumeration<String> b;

        public TwoEnumerationsWrapper(Enumeration a, Enumeration b) {
            this.a = a;
            this.b = b;
        }

        @Override
        public boolean hasMoreElements() {
            return a.hasMoreElements() || b.hasMoreElements();
        }

        @Override
        public String nextElement() {
            if (a.hasMoreElements()) {
                return a.nextElement();
            } else {
                return b.nextElement();
            }
        }
    }

}