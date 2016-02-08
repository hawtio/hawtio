package io.hawt.maven;

import java.io.Console;
import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.List;
import java.util.Set;

import io.hawt.junit.DefaultJUnitService;
import io.hawt.junit.JUnitService;
import io.hawt.util.ReflectionHelper;

import org.apache.maven.plugins.annotations.Execute;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;

@Mojo(name = "test", defaultPhase = LifecyclePhase.INTEGRATION_TEST, requiresDependencyResolution = ResolutionScope.TEST)
@Execute(phase = LifecyclePhase.PROCESS_TEST_CLASSES)
public class TestMojo extends CamelMojo {

    @Parameter(property = "hawtio.className")
    private String className;

    @Parameter(property = "hawtio.testName")
    private String testName;

    /**
     * The directory containing generated test classes of the project being tested. This will be included at the
     * beginning of the test classpath.
     */
    @Parameter( defaultValue = "${project.build.testOutputDirectory}" )
    protected File testClassesDirectory;

    private JUnitService jUnitService = new DefaultJUnitService();

    @Override
    protected void doPrepareArguments() throws Exception {
        bootstrapMain = false;

        // the main class is our unit test class
        mainClass = className;

        super.doPrepareArguments();
    }

    @Override
    protected void addCustomClasspaths(Set<URL> classpathURLs, boolean first) throws Exception {
        if (first) {
            classpathURLs.add(testClassesDirectory.toURI().toURL());
        }
    }

    @Override
    protected void afterBootstrapMain() throws Exception {
        Class<?> clazz = null;
        Object instance = null;

        if (className != null) {
            // must load class and methods using reflection as otherwise we have class-loader/compiled class issues
            getLog().info("*************************************");
            getLog().info("Testing: " + className);
            getLog().info("*************************************");

            clazz = Thread.currentThread().getContextClassLoader().loadClass(className);
            instance = ReflectionHelper.newInstance(clazz);
            getLog().debug("Loaded " + className + " and instantiated " + instance);

            ReflectionHelper.invokeMethod(jUnitService.findBeforeClass(clazz), instance);
            ReflectionHelper.invokeMethod(jUnitService.findBefore(clazz), instance);

            // loop all test methods
            List<Method> testMethods = jUnitService.findTestMethods(clazz);
            testMethods = jUnitService.filterTestMethods(testMethods, testName);
            getLog().info("Found and filtered " + testMethods.size() + " @Test methods to invoke");

            for (Method testMethod : testMethods) {
                getLog().info("Invoking @Test method " + testMethod + " on " + className);
                ReflectionHelper.invokeMethod(testMethod, instance);
            }
        }

        getLog().info("*************************************");
        getLog().info("         Press ENTER to exit         ");
        getLog().info("*************************************");
        Console console = System.console();
        console.readLine();

        if (className != null) {
            ReflectionHelper.invokeMethod(jUnitService.findAfter(clazz), instance);
            ReflectionHelper.invokeMethod(jUnitService.findAfterClass(clazz), instance);
        }
    }

}
