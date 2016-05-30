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

public class JolokiaConfiguredAgentServlet extends AgentServlet{
    private static final transient Logger LOG = LoggerFactory.getLogger(JolokiaConfiguredAgentServlet.class);

    @Override
    public void init(ServletConfig pServletConfig) throws ServletException {

        String policyLocation = System.getProperty("jolokia." + ConfigKey.POLICY_LOCATION.toString() );
        if(policyLocation != null){
            LOG.info("Jolokia will load jolokia-access.xml from [" + policyLocation + "]");
            ServletConfigWrapper pServletConfigWrapper = new  ServletConfigWrapper(pServletConfig);
            pServletConfigWrapper.addProperty(ConfigKey.POLICY_LOCATION.toString(), policyLocation);
            super.init(pServletConfigWrapper);

        } else{
            LOG.info("Jolokia has not found any jolokia-access.xml configured with " + "jolokia." + ConfigKey.POLICY_LOCATION.toString() + " ; Default configuration values will be used.");
            super.init(pServletConfig);
        }

    }

    class ServletConfigWrapper implements ServletConfig {
        ServletConfig wrapped;
        Hashtable<String,String> ownProps;

        public ServletConfigWrapper(ServletConfig pServletConfig){
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
            if(ownProps.containsKey(s)){
                return ownProps.get(s);
            }
            return wrapped.getInitParameter(s);
        }

        @Override
        public Enumeration getInitParameterNames() {
            return new TwoEnumerationsWrapper(ownProps.keys(), wrapped.getInitParameterNames());
        }

        public void addProperty(String key, String value){
            ownProps.put(key, value);
        }
    }

    class TwoEnumerationsWrapper implements Enumeration<String>{
        Enumeration<String>  a;
        Enumeration<String>  b;

        public TwoEnumerationsWrapper(Enumeration a, Enumeration b){
            this.a = a;
            this.b = b;
        }

        @Override
        public boolean hasMoreElements() {
            return a.hasMoreElements() || b.hasMoreElements();
        }

        @Override
        public String nextElement() {
            if(a.hasMoreElements()){
                return a.nextElement();
            } else{
                return b.nextElement();
            }
        }
    }

}