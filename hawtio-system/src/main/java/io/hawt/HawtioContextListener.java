package io.hawt;

import java.util.Objects;

import io.hawt.jmx.About;
import io.hawt.jmx.JMXSecurity;
import io.hawt.jmx.JmxTreeWatcher;
import io.hawt.jmx.PluginRegistry;
import io.hawt.jmx.QuartzFacade;
import io.hawt.jmx.RBACRegistry;
import io.hawt.system.ConfigManager;
import io.hawt.web.auth.AuthenticationConfiguration;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>A {@link jakarta.servlet.ServletContextListener} which initialises key Hawtio services
 * configuration and security framework in the web application for all deployment targets (WAR, SpringBoot,
 * Quarkus).</p>
 *
 * <p>This listener can be extended to provide deployment-specific behavior.</p>
 */
public class HawtioContextListener implements ServletContextListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(HawtioContextListener.class);

    private final ConfigManager configManager;

    // hawtio:type=About
    private final About about;
    // hawtio:type=TreeWatcher
    private final JmxTreeWatcher treeWatcher;
    // hawtio:type=Registry
    private final PluginRegistry registry;
    // hawtio:type=security,area=jmx,name=HawtioDummyJMXSecurity
    private final JMXSecurity jmxSecurity;
    // hawtio:type=security,name=RBACRegistry
    private final RBACRegistry rbacRegistry;
    // hawtio:type=QuartzFacade
    private final QuartzFacade quartzFacade;

    /**
     * Constructor used in WAR deployment, where the listener is declared in {@code web.xml}
     */
    public HawtioContextListener() {
        this(new ConfigManager());
    }

    /**
     * Constructor used in non-WAR deployment where we have more control over object creation. The passed
     * {@link ConfigManager} is preconfigured with deployment-specific options.
     *
     * @param configManager
     */
    public HawtioContextListener(final ConfigManager configManager) {
        this.configManager = Objects.requireNonNull(configManager);

        // basic Hawtio MBean services
        this.about = new About();
        this.treeWatcher = new JmxTreeWatcher();
        this.registry = new PluginRegistry();
        this.jmxSecurity = new JMXSecurity();
        this.rbacRegistry = new RBACRegistry();
        this.quartzFacade = new QuartzFacade();
    }

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        LOGGER.info("Initialising Hawtio services");
        ServletContext context = servletContextEvent.getServletContext();

        // registration of services available as MBeans
        try {
            about.init();
            treeWatcher.init();
            registry.init();
            jmxSecurity.init();
            rbacRegistry.init();
            quartzFacade.init();
        } catch (Exception e) {
            throw createServletException(e);
        }

        // registration of ConfigManager to be available as servlet context attribute by other servlets and filters
        context.setAttribute(ConfigManager.CONFIG_MANAGER, configManager);

        // Security configuration derived from general configuration in ConfigManager
        AuthenticationConfiguration authConfig = AuthenticationConfiguration.getConfiguration(context);
        if (!authConfig.isEnabled()) {
            // no JAAS, no OIDC, no Keycloak, no authentication at all
            return;
        }

        // JAAS configuration may be created dynamically depending on the deployment
        configureAuthenticationProviders(context, authConfig);

        // tell the auth configuration that environment/deployment-specific configuration is done, additional
        // JAAS configurations, Principal role class names and roles may have been added, so we can complete
        // the auth configuration
        authConfig.initializationComplete(context);
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        LOGGER.info("Destroying Hawtio services");
        try {
            rbacRegistry.destroy();
            about.destroy();
            treeWatcher.destroy();
            registry.destroy();
            jmxSecurity.destroy();
            quartzFacade.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    /**
     * <p>Extension method that configures additional authentication providers. Subclasses of this
     * {@link ServletContextListener} may override this method and do not have to call the super version.</p>
     *
     * <p>This method is not called if authentication is disabled in Hawtio.</p>
     *
     * @param servletContext
     * @param authConfig
     */
    protected void configureAuthenticationProviders(ServletContext servletContext, AuthenticationConfiguration authConfig) {
        // configure OIDC here, because it's needed later both in CSP filter and AuthConfigurationServlet
        authConfig.configureOidc();
    }

    protected RuntimeException createServletException(Exception e) {
        return new RuntimeException(e);
    }

}
