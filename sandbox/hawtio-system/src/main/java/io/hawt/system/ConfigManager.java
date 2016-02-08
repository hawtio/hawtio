package io.hawt.system;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 */
public class ConfigManager {
    private static final transient Logger LOG = LoggerFactory.getLogger(ConfigManager.class);

    private Context envContext = null;

    public ConfigManager() {
    }

    public void init() {
        if (Boolean.parseBoolean((String) System.getProperty("hawtio.forceProperties", "false"))) {
            LOG.info("Forced using system properties");
            return;
        }

        try {
            envContext = (Context) new InitialContext().lookup("java:comp/env");
            LOG.info("Configuration will be discovered via JNDI");
        } catch (NamingException e) {
            LOG.debug("Failed to look up environment context: ", e);
            LOG.info("Configuration will be discovered via system properties");
        }
    }

    public void destroy() {
        if (envContext != null) {
            try {
                envContext.close();
            } catch (NamingException e) {
                // ignore...
            }
            envContext = null;
        }
    }

    public String get(String name, String defaultValue) {
        String answer = null;
        if (envContext != null) {
            try {
                answer = (String) envContext.lookup("hawtio/" + name);
            } catch (Exception e) {
                // ignore...
            }
        }
        if (answer == null) {
            if (defaultValue == null) {
                answer = System.getProperty("hawtio." + name);
            } else {
                answer = System.getProperty("hawtio." + name, defaultValue.toString());
            }
        }
        if (answer == null) {
            answer = defaultValue;
        }
        LOG.debug("Property {} is set to value {}", name, answer);
        return answer;
    }

}
