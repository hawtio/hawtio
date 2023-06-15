package io.hawt.quarkus.deployment;

import java.io.InputStream;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

import io.hawt.quarkus.HawtioConfig;
import io.hawt.quarkus.HawtioProducers;
import io.hawt.quarkus.HawtioRecorder;
import io.hawt.quarkus.auth.HawtioQuarkusAuthenticator;
import io.hawt.quarkus.filters.HawtioQuarkusAuthenticationFilter;
import io.hawt.quarkus.filters.HawtioQuarkusLoginRedirectFilter;
import io.hawt.quarkus.filters.HawtioQuarkusPathFilter;
import io.hawt.quarkus.servlets.HawtioQuakusLoginServlet;
import io.hawt.quarkus.servlets.HawtioQuakusLogoutServlet;
import io.hawt.web.auth.AuthenticationFilter;
import io.hawt.web.auth.LoginRedirectFilter;
import io.hawt.web.auth.LoginServlet;
import io.hawt.web.auth.LogoutServlet;
import io.hawt.web.filters.BaseTagHrefFilter;
import io.quarkus.arc.deployment.AdditionalBeanBuildItem;
import io.quarkus.deployment.Capabilities;
import io.quarkus.deployment.Capability;
import io.quarkus.deployment.annotations.BuildProducer;
import io.quarkus.deployment.annotations.BuildStep;
import io.quarkus.deployment.annotations.ExecutionTime;
import io.quarkus.deployment.annotations.Record;
import io.quarkus.deployment.builditem.FeatureBuildItem;
import io.quarkus.deployment.builditem.SystemPropertyBuildItem;
import io.quarkus.deployment.pkg.steps.NativeBuild;
import io.quarkus.undertow.deployment.FilterBuildItem;
import io.quarkus.undertow.deployment.ListenerBuildItem;
import io.quarkus.undertow.deployment.MPConfigPropertyResolver;
import io.quarkus.undertow.deployment.ServletBuildItem;
import io.quarkus.vertx.http.deployment.RouteBuildItem;
import org.jboss.metadata.parser.servlet.WebMetaDataParser;
import org.jboss.metadata.parser.util.MetaDataElementParser;
import org.jboss.metadata.property.PropertyReplacers;
import org.jboss.metadata.web.spec.DispatcherType;
import org.jboss.metadata.web.spec.FilterMappingMetaData;
import org.jboss.metadata.web.spec.FilterMetaData;
import org.jboss.metadata.web.spec.ListenerMetaData;
import org.jboss.metadata.web.spec.ServletMappingMetaData;
import org.jboss.metadata.web.spec.ServletMetaData;
import org.jboss.metadata.web.spec.WebMetaData;

import static io.hawt.quarkus.HawtioConfig.DEFAULT_CONTEXT_PATH;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_AUTHENTICATION_ENABLED;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_KEYCLOAK_ENABLED;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_ROLE;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_ROLES;
import static io.hawt.web.auth.keycloak.KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG;
import static io.hawt.web.filters.BaseTagHrefFilter.PARAM_APPLICATION_CONTEXT_PATH;
import static io.hawt.web.proxy.ProxyServlet.HAWTIO_DISABLE_PROXY;
import static io.hawt.web.proxy.ProxyServlet.HAWTIO_LOCAL_ADDRESS_PROBING;
import static io.hawt.web.proxy.ProxyServlet.HAWTIO_PROXY_ALLOWLIST;

public class HawtioProcessor {

    private static final Set<String> DISALLOWED_SERVLETS = Set.of(
        "io.hawt.web.plugin.PluginServlet"
    );

    /**
     * For now, there are no explicitly disallowed filters.
     */
    private static final Set<String> DISALLOWED_FILTERS = Collections.emptySet();

    /**
     * For now, there are no explicitly disallowed listeners.
     */
    private static final Set<String> DISALLOWED_LISTENERS = Collections.emptySet();

    private static final Map<String, String> WEB_XML_OVERRIDES = Map.of(
        LoginServlet.class.getName(), HawtioQuakusLoginServlet.class.getName(),
        LogoutServlet.class.getName(), HawtioQuakusLogoutServlet.class.getName(),
        LoginRedirectFilter.class.getName(), HawtioQuarkusLoginRedirectFilter.class.getName(),
        AuthenticationFilter.class.getName(), HawtioQuarkusAuthenticationFilter.class.getName()
    );

    private static final String FEATURE = "hawtio";

    @BuildStep
    FeatureBuildItem feature() {
        return new FeatureBuildItem(FEATURE);
    }

    @BuildStep
    void registerHawtioBeans(
        BuildProducer<ServletBuildItem> servlet,
        BuildProducer<FilterBuildItem> filter,
        BuildProducer<ListenerBuildItem> listener
    ) throws Exception {

        final XMLInputFactory inputFactory = XMLInputFactory.newInstance();
        inputFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        MetaDataElementParser.DTDInfo dtdInfo = new MetaDataElementParser.DTDInfo();
        inputFactory.setXMLResolver(dtdInfo);

        // Parse and process the Hawtio web.xml to avoid having to manually register all the servlets, filters & mappings
        try (InputStream in = HawtioProcessor.class.getResourceAsStream("/META-INF/web.xml")) {
            final XMLStreamReader xmlReader = inputFactory.createXMLStreamReader(in);
            @SuppressWarnings("deprecation")
            WebMetaData result = WebMetaDataParser.parse(xmlReader, dtdInfo, PropertyReplacers.resolvingReplacer(new MPConfigPropertyResolver()));
            registerServlets(result, servlet);
            registerFilters(result, filter);
            registerListeners(result, listener);
        }
    }

    private void registerServlets(WebMetaData webMetaData, BuildProducer<ServletBuildItem> servlet) {
        if (webMetaData.getServlets() == null) {
            return;
        }

        for (ServletMetaData servletMetaData : webMetaData.getServlets()) {
            if (DISALLOWED_SERVLETS.contains(servletMetaData.getServletClass())) {
                continue;
            }

            ServletBuildItem.Builder builder = ServletBuildItem.builder(servletMetaData.getServletName(), getClassName(servletMetaData.getServletClass()))
                .setLoadOnStartup(servletMetaData.getLoadOnStartupDefault());

            // Servlet mappings
            getServletMappings(webMetaData, servletMetaData.getName()).ifPresent(servletMappings ->
                servletMappings.getUrlPatterns()
                    .stream()
                    .map(s -> DEFAULT_CONTEXT_PATH + s)
                    .forEach(builder::addMapping));

            // Servlet init-params
            if (servletMetaData.getInitParam() != null) {
                servletMetaData.getInitParam()
                    .forEach(param -> builder.addInitParam(param.getParamName(), param.getParamValue()));
            }

            servlet.produce(builder.build());
        }
    }

    private void registerFilters(WebMetaData webMetaData, BuildProducer<FilterBuildItem> filter) {
        // Hawtio filters
        if (webMetaData.getFilters() != null) {
            for (FilterMetaData filterMetaData : webMetaData.getFilters()) {
                if (DISALLOWED_FILTERS.contains(filterMetaData.getFilterClass())) {
                    continue;
                }

                FilterBuildItem.Builder builder = FilterBuildItem.builder(filterMetaData.getFilterName(), getClassName(filterMetaData.getFilterClass()));
                if (filterMetaData.getFilterClass().equals(BaseTagHrefFilter.class.getName())) {
                    builder.addInitParam(PARAM_APPLICATION_CONTEXT_PATH, DEFAULT_CONTEXT_PATH);
                }

                // Filter mappings
                getFilterMappings(webMetaData, filterMetaData.getName()).ifPresent(filterMappings -> {
                    for (String urlPattern : filterMappings.getUrlPatterns()) {
                        if (filterMappings.getDispatchers() != null) {
                            for (DispatcherType dispatcher : filterMappings.getDispatchers()) {
                                builder.addFilterUrlMapping(DEFAULT_CONTEXT_PATH + urlPattern, javax.servlet.DispatcherType.valueOf(dispatcher.name()));
                            }
                        } else {
                            builder.addFilterUrlMapping(DEFAULT_CONTEXT_PATH + urlPattern, javax.servlet.DispatcherType.REQUEST);
                        }
                    }
                });

                filter.produce(builder.build());
            }
        }

        // Quarkus path filter
        // This filter must be placed at the end of filter chain
        FilterBuildItem pathHandler = FilterBuildItem.builder("PathFilter", HawtioQuarkusPathFilter.class.getName())
            .addFilterUrlMapping(DEFAULT_CONTEXT_PATH + "/*", javax.servlet.DispatcherType.REQUEST)
            .build();
        filter.produce(pathHandler);

    }

    private void registerListeners(WebMetaData webMetaData, BuildProducer<ListenerBuildItem> listener) {
        if (webMetaData.getListeners() == null) {
            return;
        }

        for (ListenerMetaData listenerMetaData : webMetaData.getListeners()) {
            if (DISALLOWED_LISTENERS.contains(listenerMetaData.getListenerClass())) {
                continue;
            }
            listener.produce(new ListenerBuildItem(listenerMetaData.getListenerClass()));
        }
    }

    @BuildStep
    void unremoveableBeans(BuildProducer<AdditionalBeanBuildItem> additionalBeans) {
        additionalBeans.produce(AdditionalBeanBuildItem.unremovableOf(HawtioProducers.class));
        additionalBeans.produce(AdditionalBeanBuildItem.unremovableOf(HawtioQuarkusAuthenticator.class));
    }

    @BuildStep
    void hawtioSystemProperties(BuildProducer<SystemPropertyBuildItem> systemProperties, HawtioConfig config, Capabilities capabilities) {
        if (config.authenticationEnabled && !capabilities.isPresent(Capability.SECURITY)) {
            throw new RuntimeException("Hawtio authentication is enabled but no Quarkus security extension is present. "
                + "You must configure one or disable authentication");
        }

        systemProperties.produce(new SystemPropertyBuildItem(HAWTIO_AUTHENTICATION_ENABLED, config.authenticationEnabled.toString()));
        systemProperties.produce(new SystemPropertyBuildItem(HAWTIO_KEYCLOAK_ENABLED, config.keycloakEnabled.toString()));
        systemProperties.produce(new SystemPropertyBuildItem(HAWTIO_DISABLE_PROXY, config.disableProxy.toString()));
        systemProperties.produce(new SystemPropertyBuildItem(HAWTIO_LOCAL_ADDRESS_PROBING, config.localAddressProbing.toString()));

        config.role
            .map(role -> new SystemPropertyBuildItem(HAWTIO_ROLE, role))
            .ifPresent(systemProperties::produce);

        config.roles
            .map(roles -> new SystemPropertyBuildItem(HAWTIO_ROLES, String.join(",", roles)))
            .ifPresent(systemProperties::produce);

        config.keycloakClientConfig
            .map(keycloakClientConfig -> new SystemPropertyBuildItem(HAWTIO_KEYCLOAK_CLIENT_CONFIG, keycloakClientConfig))
            .ifPresent(systemProperties::produce);

        config.proxyAllowlist
            .map(allowlist -> new SystemPropertyBuildItem(HAWTIO_PROXY_ALLOWLIST, String.join(",", allowlist)))
            .ifPresent(systemProperties::produce);

        config.sessionTimeout
            .map(sessionTimeout -> new SystemPropertyBuildItem("hawtio.sessionTimeout", sessionTimeout.toString()))
            .ifPresent(systemProperties::produce);
    }

    @BuildStep
    @Record(ExecutionTime.STATIC_INIT)
    RouteBuildItem hawtioPluginHandler(HawtioConfig config, HawtioRecorder recorder, Capabilities capabilities) {
        if (config.pluginConfigs == null || config.pluginConfigs.isEmpty()) {
            return null;
        }

        if (capabilities.isMissing(Capability.JACKSON)) {
            throw new RuntimeException("Hawtio plugin support requires jackson. Please add a dependency for quarkus-jackson to your application");
        }

        return RouteBuildItem.builder()
            .route(HawtioConfig.DEFAULT_PLUGIN_PATH)
            .handler(recorder.pluginHandler(config.pluginConfigs))
            .build();
    }

    @BuildStep(onlyIf = NativeBuild.class)
    void nativeUnsupported() {
        throw new RuntimeException("The Hawtio Quarkus extension is not supported in native mode");
    }

    private String getClassName(String className) {
        if (WEB_XML_OVERRIDES.containsKey(className)) {
            return WEB_XML_OVERRIDES.get(className);
        }
        return className;
    }

    private Optional<ServletMappingMetaData> getServletMappings(WebMetaData metaData, String servletName) {
        return metaData.getServletMappings()
            .stream()
            .filter(servletMappingMetaData -> servletMappingMetaData.getServletName().equals(servletName))
            .findFirst();
    }

    private Optional<FilterMappingMetaData> getFilterMappings(WebMetaData metaData, String filterName) {
        return metaData.getFilterMappings()
            .stream()
            .filter(filterMappingMetaData -> filterMappingMetaData.getFilterName().equals(filterName))
            .findFirst();
    }
}
