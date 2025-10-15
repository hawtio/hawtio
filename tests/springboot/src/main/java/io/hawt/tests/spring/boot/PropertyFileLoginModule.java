package io.hawt.tests.spring.boot;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import javax.security.auth.Subject;
import javax.security.auth.callback.CallbackHandler;

import org.eclipse.jetty.security.jaas.spi.AbstractLoginModule;
import org.eclipse.jetty.security.PropertyUserStore;
import org.eclipse.jetty.security.RolePrincipal;
import org.eclipse.jetty.security.UserPrincipal;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.util.resource.ResourceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PropertyFileLoginModule extends AbstractLoginModule {
    public static final String DEFAULT_FILENAME = "realm.properties";

    private static final Logger LOG = LoggerFactory.getLogger(PropertyFileLoginModule.class);
    private static final ConcurrentHashMap<String, PropertyUserStore> PROPERTY_USERSTORES = new ConcurrentHashMap<>();

    private boolean hotReload = false;
    private String filename = null;

    /**
     * Read contents of the configured property file.
     *
     * @see javax.security.auth.spi.LoginModule#initialize(Subject, CallbackHandler, Map, Map)
     */
    @Override
    public void initialize(final Subject subject, final CallbackHandler callbackHandler,
                           final Map<String, ?> sharedState, final Map<String, ?> options) {
        super.initialize(subject, callbackHandler, sharedState, options);
        setupPropertyUserStore(options);
    }

    private void setupPropertyUserStore(final Map<String, ?> options) {
        parseConfig(options);

        if (PROPERTY_USERSTORES.get(filename) == null) {
            PropertyUserStore propertyUserStore = new PropertyUserStore();
            ResourceFactory resourceFactory = ResourceFactory.of(propertyUserStore);
            Resource config = resourceFactory.newResource(filename);

            propertyUserStore.setConfig(config);
            propertyUserStore.setHotReload(hotReload);

            final PropertyUserStore prev = PROPERTY_USERSTORES.putIfAbsent(filename, propertyUserStore);
            if (prev == null) {
                LOG.info("setupPropertyUserStore: Starting new PropertyUserStore. PropertiesFile: {} hotReload: {}",
                        filename, hotReload);

                try {
                    propertyUserStore.start();
                } catch (Exception e) {
                    LOG.warn("Exception while starting propertyUserStore: ", e);
                }
            }
        }
    }

    private void parseConfig(final Map<String, ?> options) {
        String tmp = (String) options.get("file");
        filename = (tmp == null ? DEFAULT_FILENAME : tmp);
        filename = System.getProperty("login.file", filename);
        tmp = (String) options.get("hotReload");
        hotReload = tmp == null ? hotReload : Boolean.parseBoolean(tmp);
    }

    @Override
    public JAASUser getUser(String userName) {
        final PropertyUserStore propertyUserStore = PROPERTY_USERSTORES.get(filename);
        if (propertyUserStore == null) {
            throw new IllegalStateException("PropertyUserStore should never be null here!");
        }

        LOG.trace("Checking PropertyUserStore " + filename + " for " + userName);
        final UserPrincipal userPrincipal = propertyUserStore.getUserPrincipal(userName);
        final List<RolePrincipal> rolePrincipals = propertyUserStore.getRolePrincipals(userName);

        if (userPrincipal == null || rolePrincipals == null) {
            return null;
        }

        final List<String> roles = rolePrincipals.stream().map(RolePrincipal::getName).collect(Collectors.toList());

        LOG.trace("Found: " + userName + " in PropertyUserStore " + filename);
        return new HawtioJAASUser(userPrincipal, roles);
    }

    static class HawtioJAASUser extends JAASUser {
        List<String> roles;

        public HawtioJAASUser(UserPrincipal userPrincipal, List<String> roles) {
            super(userPrincipal);
            this.roles = roles;
        }

        @Override
        public List<String> doFetchRoles() {
            return roles;
        }
    }

    @Override
    public boolean logout() {
        return true;
    }
}
