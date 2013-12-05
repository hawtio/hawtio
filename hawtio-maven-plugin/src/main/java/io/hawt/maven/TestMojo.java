/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.maven;

import java.io.Console;
import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;

import io.hawt.maven.util.IsolatedThreadGroup;
import io.hawt.maven.util.ReflectionHelper;
import io.hawt.maven.util.TestHelper;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;

@Mojo(name = "test", defaultPhase = LifecyclePhase.TEST_COMPILE, requiresDependencyResolution = ResolutionScope.TEST)
public class TestMojo extends CamelMojo {

    // TODO: parse args to find class and test name

    private String className = "com.foo.MyRouteTest";

    private String testName;

    /**
     * The directory containing generated test classes of the project being tested. This will be included at the
     * beginning of the test classpath.
     */
    @Parameter( defaultValue = "${project.build.testOutputDirectory}" )
    protected File testClassesDirectory;

    @Override
    protected void doPrepareArguments() throws Exception {
        bootstrapMain = false;
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
        // must load class and methods using reflection as otherwise we have class-loader/compiled class issues
        getLog().info("Starting " + className + "...");
        getLog().info("*************************************");

        Class clazz = Thread.currentThread().getContextClassLoader().loadClass(className);
        Object instance = ReflectionHelper.newInstance(clazz);
        getLog().debug("Loaded " + className + " and instantiated " + instance);

        Method method = clazz.getMethod("setUp");
        ReflectionHelper.invokeMethod(method, instance);
        getLog().debug("setUp() invoked");

        // loop all test methods
        Class ann = Thread.currentThread().getContextClassLoader().loadClass("org.junit.Test");
        List<Method> testMethods = TestHelper.findTestMethods(clazz, ann, testName);
        getLog().info("Found and filtered " + testMethods.size() + " @Test methods to invoke");

        final CountDownLatch latch = new CountDownLatch(testMethods.size());

        // TODO: latch for base mojo to wait to complete to terminate nicely
        IsolatedThreadGroup inProgress = new IsolatedThreadGroup(this, "testMonitor");
        final Thread bootstrapThread = new Thread(inProgress, new Runnable() {
            public void run() {
                try {
                    latch.await();
                } catch (Exception e) {
                    // ignore
                }
            }
        });

        // start monitoring thread before testing begins
        bootstrapThread.start();

        for (Method testMethod : testMethods) {
            getLog().info("Invoking @Test method " + testMethod + " on " + className);
            ReflectionHelper.invokeMethod(testMethod, instance);
            latch.countDown();
        }

        getLog().info("... press ENTER to tear down tests from " + className);
        Console console = System.console();
        console.readLine();

        method = clazz.getMethod("tearDown");
        ReflectionHelper.invokeMethod(method, instance);
        getLog().debug("tearDown() invoked");
        method = clazz.getMethod("tearDownAfterClass");
        ReflectionHelper.invokeMethod(method, null);
        getLog().debug("tearDownAfterClass() invoked");

        getLog().info("*************************************");
    }

}
