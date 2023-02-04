/*
 * Copyright (C) 2013 the original author or authors.
 * See the NOTICE file distributed with this work for additional
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
package io.hawt.util.introspect;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helper class for creating instances of {@link ClassLoaderProvider}
 */
public class ClassLoaderProviders {
    private static final Logger LOG = LoggerFactory.getLogger(ClassLoaderProviders.class);

    public static ClassLoaderProvider createConstantProvider(final ClassLoader classLoader) {
        return new ClassLoaderProvider() {
            @Override
            public ClassLoader getClassLoader() {
                return classLoader;
            }

            @Override
            public String toString() {
                return "ClassLoaderProvider(" + classLoader + ")";
            }
        };
    }

    public static ClassLoaderProvider createReflectionProvider(final Object instance, final Method method) {
        return new ClassLoaderProvider() {
            @Override
            public ClassLoader getClassLoader() {
                Object value = null;
                try {
                    value = method.invoke(instance);
                } catch (InvocationTargetException te) {
                    Throwable e = te.getTargetException();
                    LOG.warn("Failed to invoke " + method + " on " + instance + ". " + e, e);
                } catch (Exception e) {
                    LOG.warn("Failed to invoke " + method + " on " + instance + ". " + e, e);
                }
                if (value != null) {
                    if (value instanceof ClassLoader) {
                        return (ClassLoader) value;
                    } else {
                        LOG.warn("Value returned from " + method + " on " + instance + " is not a ClassLoader: " + value);
                    }
                }
                return null;
            }

            @Override
            public String toString() {
                return "ReflectionClassLoaderProvider(" + instance + ", " + method + ")";
            }
        };
    }
}
