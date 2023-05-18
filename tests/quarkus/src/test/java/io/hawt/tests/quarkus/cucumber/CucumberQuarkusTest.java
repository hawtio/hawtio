package io.hawt.tests.quarkus.cucumber;

import org.junit.jupiter.api.DynamicContainer;
import org.junit.jupiter.api.DynamicNode;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

import org.opentest4j.TestSkippedException;

import javax.enterprise.inject.Instance;
import javax.enterprise.inject.spi.CDI;

import java.lang.reflect.Constructor;
import java.time.Clock;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Predicate;

import io.cucumber.core.backend.ObjectFactory;
import io.cucumber.core.eventbus.EventBus;
import io.cucumber.core.feature.FeatureParser;
import io.cucumber.core.filter.Filters;
import io.cucumber.core.gherkin.Pickle;
import io.cucumber.core.options.CucumberOptionsAnnotationParser;
import io.cucumber.core.options.CucumberProperties;
import io.cucumber.core.options.CucumberPropertiesParser;
import io.cucumber.core.options.RuntimeOptions;
import io.cucumber.core.options.RuntimeOptionsBuilder;
import io.cucumber.core.plugin.PluginFactory;
import io.cucumber.core.plugin.Plugins;
import io.cucumber.core.plugin.PrettyFormatter;
import io.cucumber.core.runner.Runner;
import io.cucumber.core.runtime.CucumberExecutionContext;
import io.cucumber.core.runtime.ExitStatus;
import io.cucumber.core.runtime.FeaturePathFeatureSupplier;
import io.cucumber.core.runtime.FeatureSupplier;
import io.cucumber.core.runtime.ObjectFactorySupplier;
import io.cucumber.core.runtime.TestCaseResultObserver;
import io.cucumber.core.runtime.TimeServiceEventBus;
import io.cucumber.java.JavaBackendProviderService;
import io.cucumber.plugin.event.EventHandler;
import io.cucumber.plugin.event.Status;
import io.cucumber.plugin.event.TestStepFinished;
import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
public abstract class CucumberQuarkusTest {

    @TestFactory
    List<DynamicNode> getTests() {
        EventBus eventBus = new TimeServiceEventBus(Clock.systemUTC(), UUID::randomUUID);
        final FeatureParser parser = new FeatureParser(eventBus::generateId);

        RuntimeOptions propertiesFileOptions = new CucumberPropertiesParser()
            .parse(CucumberProperties.fromPropertiesFile())
            .build();

        RuntimeOptions environmentOptions = new CucumberPropertiesParser()
            .parse(CucumberProperties.fromEnvironment())
            .build(propertiesFileOptions);

        RuntimeOptions systemOptions = new CucumberPropertiesParser()
            .parse(CucumberProperties.fromSystemProperties())
            .build(environmentOptions);

        RuntimeOptions runtimeOptions;
        RuntimeOptionsBuilder runtimeOptionsBuilder = new RuntimeOptionsBuilder()
            .addDefaultFeaturePathIfAbsent()
            .addDefaultGlueIfAbsent()
            .addDefaultSummaryPrinterIfNotDisabled();

        QuarkusCucumberOptionsProvider optionsProvider = new QuarkusCucumberOptionsProvider();
        if (optionsProvider.hasOptions(this.getClass())) {
            CucumberOptionsAnnotationParser annotationParser = new CucumberOptionsAnnotationParser()
                .withOptionsProvider(optionsProvider);
            RuntimeOptions annotationOptions = annotationParser
                .parse(this.getClass())
                .build(systemOptions);
            runtimeOptions = runtimeOptionsBuilder.build(annotationOptions);
        } else {
            runtimeOptions = runtimeOptionsBuilder.build(systemOptions);
        }

        FeatureSupplier featureSupplier = new FeaturePathFeatureSupplier(() -> Thread.currentThread().getContextClassLoader(),
            runtimeOptions, parser);

        final Plugins plugins = new Plugins(new PluginFactory(), runtimeOptions);
        plugins.addPlugin(new PrettyFormatter(System.out));

        final ExitStatus exitStatus = new ExitStatus(runtimeOptions);
        plugins.addPlugin(exitStatus);
        if (runtimeOptions.isMultiThreaded()) {
            plugins.setSerialEventBusOnEventListenerPlugins(eventBus);
        } else {
            plugins.setEventBusOnEventListenerPlugins(eventBus);
        }
        ObjectFactory objectFactory = new CucumberQuarkusTest.CdiObjectFactory();

        ObjectFactorySupplier objectFactorySupplier = () -> objectFactory;

        Runner runner = new Runner(eventBus,
            Collections.singleton(new JavaBackendProviderService().create(objectFactorySupplier.get(),
                objectFactorySupplier.get(),
                () -> Thread.currentThread()
                    .getContextClassLoader())),
            objectFactorySupplier.get(),
            runtimeOptions);

        CucumberExecutionContext context = new CucumberExecutionContext(eventBus, exitStatus, () -> runner);

        List<DynamicNode> features = new LinkedList<>();
        features.add(DynamicTest.dynamicTest("Start Cucumber", context::startTestRun));

        Predicate<Pickle> filters = new Filters(runtimeOptions);

        featureSupplier.get().forEach(f -> {
            List<DynamicTest> tests = new LinkedList<>();
            tests.add(DynamicTest.dynamicTest("Start Feature", () -> context.beforeFeature(f)));
            f.getPickles()
                .stream()
                .filter(filters)
                .forEach(p -> tests.add(DynamicTest.dynamicTest(p.getName(), () -> {
                    AtomicReference<TestStepFinished> resultAtomicReference = new AtomicReference<>();
                    EventHandler<TestStepFinished> handler = event -> {
                        if (event.getResult().getStatus() != Status.PASSED) {
                            // save the first failed test step, so that we can get the line number of the cucumber file
                            resultAtomicReference.compareAndSet(null, event);
                        }
                    };

                    try (TestCaseResultObserver resultObserver = new TestCaseResultObserver(eventBus)) {

                        context.runTestCase(r -> r.runPickle(p));
                        resultObserver.assertTestCasePassed(TestSkippedException::new,
                            (t) -> new TestSkippedException("", t),
                            UndefinedStepException::new, RuntimeException::new
                        );
                    }
                })));

            if (tests.size() > 1) {
                features.add(DynamicContainer.dynamicContainer(f.getName().orElse(f.getSource()), tests.stream()));
            }
        });

        features.add(DynamicTest.dynamicTest("Finish Cucumber", context::finishTestRun));

        return features;
    }

    public static class CdiObjectFactory implements ObjectFactory {
        public CdiObjectFactory() {
        }

        public void start() {

        }

        public void stop() {

        }

        public boolean addClass(Class<?> clazz) {
            return true;
        }

        public <T> T getInstance(Class<T> type) {
            var old = Thread.currentThread().getContextClassLoader();
            try {
                Thread.currentThread().setContextClassLoader(type.getClassLoader());
                Instance<T> selected = CDI.current().select(type);
                if (selected.isUnsatisfied()) {
                    Constructor<T> constructor = type.getConstructor();
                    constructor.setAccessible(true);
                    return constructor.newInstance();
                } else {
                    return selected.get();
                }
            } catch (Exception e) {
                throw new RuntimeException("Cannot construct " + type.getName(), e);
            } finally {
                Thread.currentThread().setContextClassLoader(old);
            }
        }
    }

//    protected static <T extends CucumberQuarkusTest> void runMain(Class<T> testClass, String[] args) {
//        RuntimeOptions propertiesFileOptions = new CucumberPropertiesParser()
//            .parse(CucumberProperties.fromPropertiesFile())
//            .build();
//
//        RuntimeOptions environmentOptions = new CucumberPropertiesParser()
//            .parse(CucumberProperties.fromEnvironment())
//            .build(propertiesFileOptions);
//
//        RuntimeOptions systemOptions = new CucumberPropertiesParser()
//            .parse(CucumberProperties.fromSystemProperties())
//            .build(environmentOptions);
//
//        CommandlineOptionsParser commandlineOptionsParser = new CommandlineOptionsParser(System.out);
//        RuntimeOptions runtimeOptions = commandlineOptionsParser.parse(args).build(systemOptions);
//
//        commandlineOptionsParser.exitStatus().ifPresent(System::exit);
//
//        System.setProperty(Constants.ANSI_COLORS_DISABLED_PROPERTY_NAME, String.valueOf(runtimeOptions.isMonochrome()));
//        //TODO: CUCUMBER_PROPERTIES_FILE_NAME
//        System.setProperty(Constants.EXECUTION_DRY_RUN_PROPERTY_NAME, String.valueOf(runtimeOptions.isDryRun()));
//        System.setProperty(Constants.EXECUTION_LIMIT_PROPERTY_NAME, String.valueOf(runtimeOptions.getLimitCount()));
//        //TODO: EXECUTION_ORDER_PROPERTY_NAME runtimeOptions.getPickleOrder(); (how can we convert this?)
//        //--strict/--no-strict is already handled by the CommandlineOptionsParser EXECUTION_STRICT_PROPERTY_NAME
//        System.setProperty(Constants.WIP_PROPERTY_NAME, String.valueOf(runtimeOptions.isWip()));
//        System.setProperty(Constants.FEATURES_PROPERTY_NAME,
//            runtimeOptions.getFeaturePaths().stream().map(URI::toString).collect(Collectors.joining(",")));
//        System.setProperty(Constants.FILTER_NAME_PROPERTY_NAME,
//            runtimeOptions.getNameFilters().stream().map(Pattern::toString).collect(Collectors.joining(",")));
//        System.setProperty(Constants.FILTER_TAGS_PROPERTY_NAME,
//            runtimeOptions.getTagExpressions().stream().map(Object::toString).collect(Collectors.joining(",")));
//        System.setProperty(Constants.GLUE_PROPERTY_NAME,
//            runtimeOptions.getGlue().stream().map(URI::toString).collect(Collectors.joining(",")));
//        Optional.ofNullable(runtimeOptions.getObjectFactoryClass())
//            .ifPresent(s -> System.setProperty(Constants.OBJECT_FACTORY_PROPERTY_NAME, s.getName()));
//        System.setProperty(Constants.PLUGIN_PROPERTY_NAME,
//            runtimeOptions.plugins().stream().map(Options.Plugin::pluginString).collect(Collectors.joining(",")));
//        //Not supported via CLI argument: PLUGIN_PUBLISH_ENABLED_PROPERTY_NAME
//        //Not supported via CLI argument: PLUGIN_PUBLISH_TOKEN_PROPERTY_NAME
//        //Not supported via CLI argument: PLUGIN_PUBLISH_URL_PROPERTY_NAME
//        //Not supported via CLI argument: PLUGIN_PUBLISH_QUIET_PROPERTY_NAME
//        System.setProperty(Constants.SNIPPET_TYPE_PROPERTY_NAME, runtimeOptions.getSnippetType().toString().toLowerCase());
//
//        ConsoleLauncher.main("-c", testClass.getName());
//    }
}
