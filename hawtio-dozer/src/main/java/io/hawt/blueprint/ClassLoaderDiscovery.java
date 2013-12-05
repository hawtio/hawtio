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
package io.hawt.blueprint;

import io.hawt.util.introspect.ClassLoaderProvider;
import io.hawt.util.introspect.ClassLoaderProviders;
import io.hawt.introspect.Introspector;
import org.osgi.service.blueprint.container.BlueprintContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.Set;

/**
 * Discovers available ClassLoaders for injecting into the Introspector
 */
public class ClassLoaderDiscovery {
    private static final transient Logger LOG = LoggerFactory.getLogger(ClassLoaderDiscovery.class);

    private Introspector introspector;
    private BlueprintContainer blueprintContainer;

    public ClassLoaderDiscovery() {
    }

    public void init() {
        LOG.info("Invoked with introspector " + introspector + " and container: " + blueprintContainer);

        if (introspector != null && blueprintContainer != null) {
            Set<String> componentIds = blueprintContainer.getComponentIds();

            // TODO would be nice to query classes available or something...
            String jaxbId = "jaxbDataFormat";
            ClassLoaderProvider classLoaderProvider = null;
            if (componentIds.contains(jaxbId)) {
                Object instance = blueprintContainer.getComponentInstance(jaxbId);
                if (instance != null) {
                    LOG.info("Found dynamic JAXB DataFormat: " + instance);
                    try {
                        Method method = instance.getClass().getMethod("getClassLoader");
                        classLoaderProvider = ClassLoaderProviders.createReflectionProvider(instance, method);
                    } catch (Exception e) {
                        LOG.info("Could not find getClassLoader() on " + instance + ". " + e, e);
                    }
                }
            } else {
                LOG.info("Could not find blueprint componentId: '" + jaxbId + "' but had IDs: " + componentIds);
            }
            introspector.setClassLoaderProvider(jaxbId, classLoaderProvider);
            LOG.info("Setting class loader " + jaxbId + " to " + classLoaderProvider);
        }
    }

    public void destroy() {
    }

    public Introspector getIntrospector() {
        return introspector;
    }

    public void setIntrospector(Introspector introspector) {
        this.introspector = introspector;
    }

    public BlueprintContainer getBlueprintContainer() {
        return blueprintContainer;
    }

    public void setBlueprintContainer(BlueprintContainer blueprintContainer) {
        this.blueprintContainer = blueprintContainer;
    }
}
