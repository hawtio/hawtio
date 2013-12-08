/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.jaxb.dynamic.file;

import org.apache.aries.blueprint.container.BlueprintContainerImpl;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * A base class for running tests on a blueprint-web container
 */
public class BlueprintTestSupport {
    private static final transient Logger LOG = LoggerFactory.getLogger(BlueprintTestSupport.class);
    protected static BlueprintContainerImpl blueprintContainer;

    public static String getBaseDir() {
        return System.getProperty("basedir", ".");
    }

    @BeforeClass
    public static void init() throws Exception {
        List<URL> resourcePaths = new ArrayList<URL>();
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Enumeration<URL> resources = classLoader.getResources("OSGI-INF/blueprint/blueprint.xml");
        while (resources.hasMoreElements()) {
            URL url = resources.nextElement();
            String text = url.toString();
            if (text.contains("karaf")) {
                LOG.info("Ignoring karaf based blueprint file " + text);
            } else if (text.contains("hawtio-json-schema-mbean")) {
                LOG.info("Ignoring hawtio-json-schema-mbean blueprint as its using <reference-list/> which is not suported yet in blueprint-web " + text);
            } else {
                resourcePaths.add(url);
            }
        }
        LOG.info("Loading Blueprint contexts " + resourcePaths);

        Map<String, String> properties = new HashMap<String, String>();
        String configDir = getBaseDir() + "/src/test/config";
        properties.put("hawtio.config.dir", configDir);
        LOG.info("Using properties: " + properties);

        blueprintContainer = new BlueprintContainerImpl(classLoader, resourcePaths, properties, true);
        // No need to call init - it results in: org.apache.aries.blueprint.ComponentNameAlreadyInUseException: Name 'blueprintContainer' is already in use by a registered component
        //blueprintContainer.init();
    }

    @AfterClass
    public static void destroy() throws Exception {
        if (blueprintContainer != null) {
            blueprintContainer.destroy();
            blueprintContainer = null;
        }
    }

    /**
     * Returns the component instance from the blueprint container with the given ID or fails the test if it cannot be found
     */
    public <T> T getComponent(String id, Class<T> aClass) {
        Object instance = blueprintContainer.getComponentInstance(id);
        assertNotNull("No component found for id '" + id + "'", instance);
        assertTrue("Instance is not an instanceof " + aClass.getName() + " but is " + instance.getClass().getName(), aClass.isInstance(instance));
        return aClass.cast(instance);
    }
}
