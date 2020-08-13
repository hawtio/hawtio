package io.hawt.quarkus.deployment;

import io.hawt.quarkus.HawtioConfig;
import io.hawt.quarkus.HawtioQuakusLoginServlet;
import io.hawt.quarkus.HawtioQuakusLogoutServlet;
import io.hawt.quarkus.HawtioQuarkusLoginRedirectFilter;
import io.hawt.quarkus.HawtioProducers;
import io.hawt.quarkus.HawtioQuarkusPathFilter;
import io.hawt.quarkus.HawtioRecorder;
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

import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

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
import static io.hawt.web.filters.BaseTagHrefFilter.PARAM_APPLICATION_CONTEXT_PATH;

public class HawtioProcessor {

    private static final List<String> DISALLOWED_LISTENERS = Arrays.asList(
        "io.hawt.blueprint.HawtioBlueprintContextListener"
    );

    private static final List<String> DISALLOWED_SERVLETS = Arrays.asList(
        "io.hawt.web.plugin.PluginServlet"
    );

    private static final Map<String, String> WEB_XML_OVERRIDES = new HashMap<String, String>() {{
        put(LoginServlet.class.getName(), HawtioQuakusLoginServlet.class.getName());
        put(LogoutServlet.class.getName(), HawtioQuakusLogoutServlet.class.getName());
        put(LoginRedirectFilter.class.getName(), HawtioQuarkusLoginRedirectFilter.class.getName());
    }};

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

        // Parse and process the Hawtio web.xml to avoid having to manually register all of the servlets, filters & mappings
        try (InputStream in = HawtioProcessor.class.getResourceAsStream("/META-INF/web.xml")) {
            final XMLStreamReader xmlReader = inputFactory.createXMLStreamReader(in);
            WebMetaData result = WebMetaDataParser.parse(xmlReader, dtdInfo, PropertyReplacers.resolvingReplacer(new MPConfigPropertyResolver()));

            // Hawtio servlets
            if (result.getServlets() != null) {
                for (ServletMetaData servletMetaData : result.getServlets()) {
                    if (DISALLOWED_SERVLETS.contains(servletMetaData.getServletClass())) {
                        continue;
                    }

                    ServletBuildItem.Builder builder = ServletBuildItem.builder(servletMetaData.getServletName(), getClassName(servletMetaData.getServletClass()));
                    builder.setLoadOnStartup(servletMetaData.getLoadOnStartupDefault());

                    // Servlet mappings
                    ServletMappingMetaData servletMappings = getServletMappings(result, servletMetaData.getName());
                    if (servletMappings != null) {
                        servletMappings.getUrlPatterns()
                            .stream()
                            .map(s -> DEFAULT_CONTEXT_PATH + s)
                            .forEach(builder::addMapping);
                    }

                    // Servlet init-params
                    if (servletMetaData.getInitParam() != null) {
                        servletMetaData.getInitParam()
                            .forEach(param -> builder.addInitParam(param.getParamName(), param.getParamValue()));
                    }

                    servlet.produce(builder.build());
                }
            }

            // Quarkus path filter
            FilterBuildItem pathHandler = FilterBuildItem.builder("PathFilter", HawtioQuarkusPathFilter.class.getName())
                .addFilterUrlMapping(DEFAULT_CONTEXT_PATH + "/*", javax.servlet.DispatcherType.REQUEST)
                .build();
            filter.produce(pathHandler);

            // Hawtio filters
            if (result.getFilters() != null) {
                for (FilterMetaData filterMetaData : result.getFilters()) {
                    FilterBuildItem.Builder builder = FilterBuildItem.builder(filterMetaData.getFilterName(), getClassName(filterMetaData.getFilterClass()));
                    if (filterMetaData.getFilterClass().equals(BaseTagHrefFilter.class.getName())) {
                        builder.addInitParam(PARAM_APPLICATION_CONTEXT_PATH, DEFAULT_CONTEXT_PATH);
                    }

                    // Filter mappings
                    FilterMappingMetaData filterMappings = getFilterMappings(result, filterMetaData.getName());
                    if (filterMappings != null) {
                        for (String urlPattern : filterMappings.getUrlPatterns()) {
                            if (filterMappings.getDispatchers() != null) {
                                for (DispatcherType dispatcher : filterMappings.getDispatchers()) {
                                    builder.addFilterUrlMapping(DEFAULT_CONTEXT_PATH + urlPattern, javax.servlet.DispatcherType.valueOf(dispatcher.name()));
                                }
                            } else {
                                builder.addFilterUrlMapping(DEFAULT_CONTEXT_PATH + urlPattern, javax.servlet.DispatcherType.REQUEST);
                            }
                        }
                    }

                    filter.produce(builder.build());
                }
            }

            // Configure Hawtio listeners
            if (result.getListeners() != null) {
                for (ListenerMetaData listenerMetaData : result.getListeners()) {
                    if (!DISALLOWED_LISTENERS.contains(listenerMetaData.getListenerClass())) {
                        listener.produce(new ListenerBuildItem(listenerMetaData.getListenerClass()));
                    }
                }
            }
        }
    }

    @BuildStep
    void unremoveableBeans(BuildProducer<AdditionalBeanBuildItem> additionalBeans) {
        additionalBeans.produce(AdditionalBeanBuildItem.unremovableOf(HawtioProducers.class));
    }

    @BuildStep
    void hawtioSystemProperties(BuildProducer<SystemPropertyBuildItem> systemProperties, HawtioConfig config, Capabilities capabilities) {
        if (config.authenticationEnabled && !capabilities.isPresent(Capability.SECURITY)) {
            throw new RuntimeException("Hawtio authentication is enabled but no Quarkus security extension is present. "
                + "You must configure one or disable authentication");
        }

        systemProperties.produce(new SystemPropertyBuildItem("hawtio.authenticationEnabled", config.authenticationEnabled.toString()));
        systemProperties.produce(new SystemPropertyBuildItem("hawtio.disableProxy", config.disableProxy.toString()));
        systemProperties.produce(new SystemPropertyBuildItem("hawtio.localAddressProbing", config.localAddressProbing.toString()));

        config.proxyAllowList.ifPresent(allowList -> systemProperties.produce(
            new SystemPropertyBuildItem("hawtio.proxyAllowList", String.join(",", allowList)))
        );

        config.role.ifPresent(role -> systemProperties.produce(
            new SystemPropertyBuildItem("hawtio.role", role))
        );

        config.roles.ifPresent(roles -> systemProperties.produce(
            new SystemPropertyBuildItem("hawtio.roles", String.join(",", roles)))
        );

        config.sessionTimeout.ifPresent(sessionTimeout -> systemProperties.produce(
            new SystemPropertyBuildItem("hawtio.sessionTimeout", sessionTimeout.toString()))
        );
    }

    @BuildStep
    @Record(ExecutionTime.STATIC_INIT)
    RouteBuildItem hawtioPluginHandler(HawtioConfig config, HawtioRecorder recorder, Capabilities capabilities) {
        if (config.pluginConfigs != null && !config.pluginConfigs.isEmpty()) {
            if (!capabilities.isPresent(Capability.JACKSON)) {
                throw new RuntimeException("Hawtio plugin support requires jackson. Please add a dependency for quarkus-jackson to your application");
            }
            return new RouteBuildItem(HawtioConfig.DEFAULT_PLUGIN_CONTEXT_PATH, recorder.pluginHandler(config.pluginConfigs));
        }
        return null;
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

    private ServletMappingMetaData getServletMappings(WebMetaData metaData, String servletName) {
        return metaData.getServletMappings()
            .stream()
            .filter(servletMappingMetaData -> servletMappingMetaData.getServletName().equals(servletName))
            .findFirst()
            .orElse(null);
    }

    private FilterMappingMetaData getFilterMappings(WebMetaData metaData, String filterName) {
        return metaData.getFilterMappings()
            .stream()
            .filter(filterMappingMetaData -> filterMappingMetaData.getFilterName().equals(filterName))
            .findFirst()
            .orElse(null);
    }
}
