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
import java.lang.annotation.Annotation;
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
import java.util.SortedMap;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.WeakHashMap;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import io.hawt.util.Predicate;
import io.hawt.util.ReflectionHelper;
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

    /**
     * Searches for the available class names given the text search
     *
     * @return all the class names found on the current classpath using the given text search filter
     */
    public SortedSet<String> findClassNames(String search, Integer limit) {
        Map<Package, ClassLoader[]> packageMap = Packages.getPackageMap(getClassLoaders(), ignorePackages);
        return findClassNamesInPackages(search, limit, packageMap);
    }

    public SortedSet<String> findClassNamesMethodsAnnotatedWith(String annotationClassName) {
        Map<Package, ClassLoader[]> packageMap = Packages.getPackageMap(getClassLoaders(), ignorePackages);
        return findClassNamesMethodsAnnotatedWith(annotationClassName, null, packageMap);
    }

    public SortedSet<String> findClassNamesInDirectoryWithMethodAnnotatedWith(File dir, String annotationClassName) {
        SortedSet<String> answer = new TreeSet<>();
        final Class<? extends Annotation> annotationClass = optionallyFindAnnotationClass(annotationClassName);
        if (annotationClass != null && dir.exists()) {
            addClassNamesInDirectoryWithMethodsAnnotatedWith(answer, dir, annotationClass, "");
        }
        return answer;
    }

    protected void addClassNamesInDirectoryWithMethodsAnnotatedWith(SortedSet<String> answer, File dir,
                                                                    Class<? extends Annotation> annotationClass, String packageName) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    addClassNamesInDirectoryWithMethodsAnnotatedWith(answer, file, annotationClass, packageName + file.getName() + ".");
                } else if (file.isFile()) {
                    String name = file.getName();
                    if (name.endsWith(".class")) {
                        String className = packageName + (name.substring(0, name.length() - 6).replace('$', '.'));
                        Class<?> aClass = optionallyFindClass(className);
                        if (aClass != null && ReflectionHelper.hasMethodWithAnnotation(aClass, annotationClass, true)) {
                            answer.add(className);
                        }
                    }
                }
            }
        }
    }

    protected Class<? extends Annotation> optionallyFindAnnotationClass(String annotationClassName) {
        final Class<? extends Annotation> annotationClass = optionallyFindClass(annotationClassName).asSubclass(Annotation.class);
        if (Annotation.class.isAssignableFrom(annotationClass)) {
            return annotationClass;
        }
        return null;
    }

    public SortedSet<String> findClassNamesMethodsAnnotatedWith(String annotationClassName, Integer limit, Map<Package, ClassLoader[]> packages) {
        final Class<? extends Annotation> annotationClass = optionallyFindAnnotationClass(annotationClassName);
        if (annotationClass != null) {
            Predicate<String> filter = className -> {
                Class<?> aClass = optionallyFindClass(className);
                if (aClass != null) {
                    return ReflectionHelper.hasMethodWithAnnotation(aClass, annotationClass, true);
                }
                return false;
            };
            return findClassNames(packages, filter, limit);
        }
        return new TreeSet<>();
    }

    public SortedSet<String> findClassNamesInPackages(final String search, Integer limit, Map<Package, ClassLoader[]> packages) {
        Predicate<String> filter = aClass -> classNameMatches(aClass, search);
        return findClassNames(packages, filter, limit);
    }

    protected SortedSet<String> findClassNames(Map<Package, ClassLoader[]> packages, Predicate<String> filter, Integer limit) {
        SortedSet<String> answer = new TreeSet<>();
        SortedSet<String> classes = new TreeSet<>();

        Set<Map.Entry<Package, ClassLoader[]>> entries = packages.entrySet();
        for (Map.Entry<Package, ClassLoader[]> entry : entries) {
            Package aPackage = entry.getKey();
            ClassLoader[] classLoaders = entry.getValue();
            CacheValue cacheValue = packageCache.get(aPackage);
            if (cacheValue == null) {
                cacheValue = createPackageCacheValue(aPackage, classLoaders);
                packageCache.put(aPackage, cacheValue);
            }
            classes.addAll(cacheValue.getClassNames());
        }

/*
        for (Map.Entry<String, ClassResource> entry : entries) {
            String key = entry.getKey();
            ClassResource classResource = entry.getValue();
            CacheValue cacheValue = cache.get(key);
            if (cacheValue == null) {
                cacheValue = createCacheValue(key, classResource);
                cache.put(key, cacheValue);
            }
            classes.addAll(cacheValue.getClassNames());
            //addClassesForPackage(classResource, search, limit, classes);
        }
*/

        if (withinLimit(limit, answer)) {
            for (String aClass : classes) {
                if (filter.evaluate(aClass)) {
                    answer.add(aClass);
                    if (!withinLimit(limit, answer)) {
                        break;
                    }
                }
            }
        }
        return answer;
    }

    /**
     * Returns all the classes found in a sorted map
     */
    public SortedMap<String, Class<?>> getAllClassesMap() {
        Package[] packages = Package.getPackages();
        return getClassesMap(packages);
    }

    /**
     * Returns all the classes found in a sorted map for the given list of packages
     */
    public SortedMap<String, Class<?>> getClassesMap(Package... packages) {
        SortedMap<String, Class<?>> answer = new TreeMap<>();
        Map<String, ClassResource> urlSet = new HashMap<>();
        for (Package aPackage : packages) {
            addPackageResources(aPackage, urlSet, classLoaders);
        }
        for (ClassResource classResource : urlSet.values()) {
            Set<Class<?>> classes = getClassesForPackage(classResource, null, null);
            for (Class<?> aClass : classes) {
                answer.put(aClass.getName(), aClass);
            }
        }
        return answer;
    }

    public Set<Class<?>> getClassesForPackage(ClassResource classResource, String filter, Integer limit) {
        Set<Class<?>> classes = new HashSet<>();
        addClassesForPackage(classResource, filter, limit, classes);
        return classes;
    }

    /**
     * Finds a class from its name
     */
    public Class<?> findClass(String className) throws ClassNotFoundException {
        for (String skip : SKIP_CLASSES) {
            if (skip.equals(className)) {
                return null;
            }
        }

        for (ClassLoader classLoader : getClassLoaders()) {
            try {
                return classLoader.loadClass(className);
            } catch (ClassNotFoundException e) {
                // ignore
            }
        }
        return Class.forName(className);
    }

    /**
     * Returns the given class or null if it cannot be loaded
     */
    public Class<?> optionallyFindClass(String className) {
        try {
            return findClass(className);
        } catch (Throwable e) {
            // ignore
            return null;
        }
    }

    /**
     * Tries to find as many of the class names on the class loaders as possible and return them
     */
    public List<Class<?>> optionallyFindClasses(Iterable<String> classNames) {
        List<Class<?>> answer = new ArrayList<>();
        for (String className : classNames) {
            Class<?> aClass = optionallyFindClass(className);
            if (aClass != null) {
                answer.add(aClass);
            }
        }
        return answer;
    }

    public Set<String> getIgnorePackages() {
        return ignorePackages;
    }

    public void setIgnorePackages(Set<String> ignorePackages) {
        this.ignorePackages = ignorePackages;
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

    protected void addClassesForPackage(ClassResource classResource, String filter, Integer limit, Set<Class<?>> classes) {
        String packageName = classResource.getPackageName();
        URL resource = classResource.getResource();
        if (resource != null && withinLimit(limit, classes)) {
            String resourceText = resource.toString();
            LOG.debug("Searching resource " + resource);
            if (resourceText.startsWith("jar:")) {
                processJar(classResource, classes, filter, limit);
            } else {
                processDirectory(new File(resource.getPath()), packageName, classes, filter, limit);
            }
        }
    }

    protected void processDirectory(File directory, String packageName, Set<Class<?>> classes, String filter, Integer limit) {
        String[] fileNames = directory.list();
        if (fileNames != null) {
            for (String fileName : fileNames) {
                if (!withinLimit(limit, classes)) {
                    return;
                }
                String className = null;
                String packagePrefix = Strings.isNotBlank(packageName) ? packageName + '.' : packageName;
                if (fileName.endsWith(".class")) {
                    className = packagePrefix + fileName.substring(0, fileName.length() - 6);
                }
                Class<?> aClass = tryFindClass(className, filter);
                if (aClass != null) {
                    classes.add(aClass);
                }
                File subdir = new File(directory, fileName);
                if (subdir.isDirectory()) {
                    processDirectory(subdir, packagePrefix + fileName, classes, filter, limit);
                }
            }
        }
    }

    protected void processJar(ClassResource classResource, Set<Class<?>> classes, String filter, Integer limit) {
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
        while (entries.hasMoreElements() && withinLimit(limit, classes)) {
            JarEntry entry = entries.nextElement();
            String entryName = entry.getName();
            String className = null;
            if (entryName.endsWith(".class") && entryName.startsWith(relativePath) && entryName.length() > (relativePath.length() + 1)) {
                className = entryName.replace('/', '.').replace('\\', '.').replace(".class", "");
            }
            Class<?> aClass = tryFindClass(className, filter);
            if (aClass != null) {
                classes.add(aClass);
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

    protected Class<?> tryFindClass(String className, String filter) {
        Class<?> aClass = null;
        if (Strings.isNotBlank(className) && classNameMatches(className, filter)) {
            try {
                aClass = findClass(className);
            } catch (Throwable e) {
                LOG.debug("Could not load class " + className + ". " + e, e);
            }
        }
        return aClass;
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
