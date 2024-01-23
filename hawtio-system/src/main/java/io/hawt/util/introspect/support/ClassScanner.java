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

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.WeakHashMap;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import io.hawt.util.Strings;
import io.hawt.util.introspect.ClassLoaderProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A helper class to scan classes on the classpath
 */
public class ClassScanner {
    private static final Logger LOG = LoggerFactory.getLogger(ClassScanner.class);

    // lets skip some classes which can cause ugly WARN logging when doing package scanning
    private static final String[] SKIP_CLASSES = new String[] { "org.apache.log4j.net.ZeroConfSupport" };

    private final ClassLoader[] classLoaders;

    private final WeakHashMap<String, CacheValue> cache = new WeakHashMap<>();
    private final WeakHashMap<Package, CacheValue> packageCache = new WeakHashMap<>();
    private final Map<String, ClassLoaderProvider> classLoaderProviderMap = new HashMap<>();
    private Set<String> ignorePackages = new HashSet<>(Collections.singletonList("sun.reflect.misc"));

    public static ClassScanner newInstance() {
        return new ClassScanner(Thread.currentThread().getContextClassLoader(), ClassScanner.class.getClassLoader());
    }

    public ClassScanner(ClassLoader... classLoaders) {
        this.classLoaders = classLoaders;
    }

    public void clearCache() {
        cache.clear();
        packageCache.clear();
        classLoaderProviderMap.clear();
    }

    /**
     * Registers a named class loader provider or removes it if the classLoaderProvider is null
     */
    public void setClassLoaderProvider(String id, ClassLoaderProvider classLoaderProvider) {
        if (classLoaderProvider != null) {
            classLoaderProviderMap.put(id, classLoaderProvider);
        } else {
            classLoaderProviderMap.remove(id);
        }
    }

    // Implementation methods
    //-------------------------------------------------------------------------
    protected void addPackageResources(Package aPackage, Map<String, ClassResource> urlSet, ClassLoader[] classLoaders) {
        String packageName = aPackage.getName();
        String relativePath = getPackageRelativePath(packageName);
        List<URL> resources = getResources(relativePath, classLoaders);
        for (URL resource : resources) {
            String key = getJavaResourceKey(resource);
            urlSet.put(key, new ClassResource(packageName, resource));
        }
    }

    private CacheValue createPackageCacheValue(Package aPackage, ClassLoader[] classLoaders) {
        Map<String, ClassResource> urlSet = new HashMap<>();
        addPackageResources(aPackage, urlSet, classLoaders);

        CacheValue answer = new CacheValue();
        SortedSet<String> classNames = answer.getClassNames();
        Set<Map.Entry<String, ClassResource>> entries = urlSet.entrySet();
        for (Map.Entry<String, ClassResource> entry : entries) {
            String key = entry.getKey();
            ClassResource classResource = entry.getValue();
            CacheValue cacheValue = cache.get(key);
            if (cacheValue == null) {
                cacheValue = createCacheValue(key, classResource);
                cache.put(key, cacheValue);
            }
            classNames.addAll(cacheValue.getClassNames());
        }
        return answer;
    }

    protected CacheValue createCacheValue(String key, ClassResource classResource) {
        CacheValue answer = new CacheValue();
        SortedSet<String> classNames = answer.getClassNames();
        String packageName = classResource.getPackageName();
        URL resource = classResource.getResource();
        if (resource != null) {
            String resourceText = resource.toString();
            LOG.debug("Searching resource " + resource);
            if (resourceText.startsWith("jar:")) {
                processJarClassNames(classResource, classNames);
            } else {
                processDirectoryClassNames(new File(resource.getPath()), packageName, classNames);
            }
        }
        return answer;
    }

    protected void processDirectoryClassNames(File directory, String packageName, Set<String> classes) {
        String[] fileNames = directory.list();
        if (fileNames != null) {
            for (String fileName : fileNames) {
                String packagePrefix = Strings.isNotBlank(packageName) ? packageName + '.' : packageName;
                if (fileName.endsWith(".class")) {
                    String className = packagePrefix + fileName.substring(0, fileName.length() - 6);
                    classes.add(className);
                }
                File subdir = new File(directory, fileName);
                if (subdir.isDirectory()) {
                    processDirectoryClassNames(subdir, packagePrefix + fileName, classes);
                }
            }
        }
    }

    protected void processJarClassNames(ClassResource classResource, Set<String> classes) {
        URL resource = classResource.getResource();
        String packageName = classResource.getPackageName();
        String relativePath = getPackageRelativePath(packageName);
        String jarPath = getJarPath(resource);
        JarFile jarFile;
        try {
            jarFile = new JarFile(jarPath);
        } catch (IOException e) {
            LOG.debug("IOException reading JAR '" + jarPath + ". Reason: " + e, e);
            return;
        }
        Enumeration<JarEntry> entries = jarFile.entries();
        while (entries.hasMoreElements()) {
            JarEntry entry = entries.nextElement();
            String entryName = entry.getName();
            if (entryName.endsWith(".class") && entryName.startsWith(relativePath) && entryName.length() > (relativePath.length() + 1)) {
                String className = entryName.replace('/', '.').replace('\\', '.').replace(".class", "");
                classes.add(className);
            }
        }

        // let's not leak resources
        try {
            jarFile.close();
        } catch (IOException e) {
            LOG.debug("IOException closing JAR '" + jarPath + "'. Reason: " + e, e);
        }
    }



    protected String getJavaResourceKey(URL resource) {
        String resourceText = resource.toString();
        if (resourceText.startsWith("jar:")) {
            return "jar:" + getJarPath(resource);
        } else {
            return resource.getPath();
        }
    }

    private String getJarPath(URL resource) {
        String resourcePath = resource.getPath();
        return resourcePath.replaceFirst("[.]jar[!].*", ".jar").replaceFirst("file:", "");
    }

    protected List<URL> getResources(String relPath, ClassLoader... classLoaders) {
        List<URL> answer = new ArrayList<>();
        for (ClassLoader classLoader : classLoaders) {
            try {
                Enumeration<URL> resources = classLoader.getResources(relPath);
                while (resources.hasMoreElements()) {
                    URL url = resources.nextElement();
                    if (url != null) {
                        answer.add(url);
                    }
                }
            } catch (IOException e) {
                LOG.warn("Failed to load resources for path " + relPath + " from class loader " + classLoader + ". Reason:  " + e, e);
            }
            // Lets add all the parent class loaders...
            if (classLoader instanceof URLClassLoader) {
                URLClassLoader loader = (URLClassLoader) classLoader;
                answer.addAll(Arrays.asList(loader.getURLs()));
            }
        }
        return answer;
    }

    /**
     * Returns true if the given class name matches the filter search
     */
    protected boolean classNameMatches(String className, String search) {
        return className.contains(search);
    }

    protected String getPackageRelativePath(String packageName) {
        return packageName.replace('.', '/');
    }

    /**
     * Returns true if we are within the limit value for the number of results in the collection
     */
    protected boolean withinLimit(Integer limit, Collection<?> collection) {
        if (limit == null) {
            return true;
        } else {
            int value = limit;
            return value <= 0 || value > collection.size();
        }
    }

    public List<ClassLoader> getClassLoaders() {
        List<ClassLoader> answer = new ArrayList<>(Arrays.asList(classLoaders));

        Collection<ClassLoaderProvider> classLoaderProviders = classLoaderProviderMap.values();
        for (ClassLoaderProvider classLoaderProvider : classLoaderProviders) {
            ClassLoader classLoader = classLoaderProvider.getClassLoader();
            if (classLoader != null) {
                answer.add(classLoader);
            }
        }
        return answer;
    }

}
