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
package io.hawt.util.introspect.support;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 */
public class Packages {
    private static final Logger LOG = LoggerFactory.getLogger(Packages.class);

    public static Package[] findPackagesForClassLoader(ClassLoader loader) {
        IntrospectClassLoader introspectClassLoader = new IntrospectClassLoader(loader);
        return introspectClassLoader.getPackages();
    }
/*

    public static Map<Package,ClassLoader[]> getPackageSet(List<ClassLoader> classLoaders) {
        Set<Package> packages = new HashSet<Package>();
        add(packages, Package.getPackages());
        for (ClassLoader classLoader : classLoaders) {
            Package[] loaderPackages = findPackagesForClassLoader(classLoader);
            add(packages, loaderPackages);
        }
        SortedSet<String> names = new TreeSet<String>();
        for (Package aPackage : packages) {
            names.add(aPackage.getName());
        }
        for (String name : names) {
            LOG.info("Got package " + name);
        }
        return packages;
    }
*/

    public static Map<Package, ClassLoader[]> getPackageMap(List<ClassLoader> classLoaders, Set<String> ignorePackages) {
        Map<Package, ClassLoader[]> answer = new HashMap<>();

        ClassLoader[] globalClassLoaders = {Thread.currentThread().getContextClassLoader(),
                ClassScanner.class.getClassLoader()};

        // TODO: fix packages are always empty
        Set<Package> packages = new HashSet<>();
        add(answer, Package.getPackages(), globalClassLoaders, ignorePackages);

        ClassLoader[] classLoaderArray = new ClassLoader[classLoaders.size()];
        classLoaders.toArray(classLoaderArray);

        for (ClassLoader classLoader : classLoaders) {
            Package[] loaderPackages = findPackagesForClassLoader(classLoader);
            add(answer, loaderPackages, classLoaderArray, ignorePackages);
        }
        SortedSet<String> names = new TreeSet<>();
        for (Package aPackage : packages) {
            names.add(aPackage.getName());
        }
        for (String name : names) {
            LOG.info("Got package " + name);
        }
        return answer;
    }

    protected static void add(Map<Package, ClassLoader[]> answer, Package[] packages, ClassLoader[] classLoaders, Set<String> ignorePackages) {
        if (packages != null) {
            for (Package aPackage : packages) {
                String name = aPackage.getName();
                if (!ignorePackages.contains(name)) {
                    answer.put(aPackage, classLoaders);
                }
            }
        }
    }

    protected static class IntrospectClassLoader extends ClassLoader {
        public IntrospectClassLoader(ClassLoader parent) {
            super(parent);
        }

        @Override
        public Package[] getPackages() {
            return super.getPackages();
        }

        @Override
        public Package getPackage(String name) {
            return super.getPackage(name);
        }
    }
}
