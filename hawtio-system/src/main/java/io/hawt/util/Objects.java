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
package io.hawt.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.Properties;
import java.util.jar.Attributes;
import java.util.jar.Manifest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some helper methods - though could be replaced by JDK 1.7 code now in java.util.Objects
 * whenever we are happy to ignore JDK 1.6
 */
public class Objects {
    private static final Logger LOG = LoggerFactory.getLogger(Objects.class);

    public static boolean equals(Object a, Object b) {
        if (a == b) {
            return true;
        } else {
            return a != null && a.equals(b);
        }
    }

    public static int compare(Comparable a, Comparable b) {
        if (a == b) {
            return 0;
        }
        if (a == null) {
            return -1;
        }
        if (b == null) {
            return 1;
        }
        return a.compareTo(b);
    }


    /**
     * Returns the version of the given class's package or the group and artifact of the jar
     */
    public static String getVersion(Class<?> aClass, String groupId, String artifactId) {
        String version = null;
        // let's try to find the maven property - as the Java API rarely works :)
        InputStream is = null;
        String fileName = "/META-INF/maven/" +
                groupId + "/" + artifactId +
                "/pom.properties";
        // try to load from maven properties first
        try {
            Properties p = new Properties();
            is = aClass.getResourceAsStream(fileName);
            if (is != null) {
                p.load(is);
                version = p.getProperty("version", "");
            }
        } catch (Exception e) {
            // ignore
        } finally {
            if (is != null) {
                IOHelper.close(is, fileName, LOG);
            }
        }
        if (version == null) {
            Package aPackage = aClass.getPackage();
            if (aPackage != null) {
                version = aPackage.getImplementationVersion();
                if (Strings.isBlank(version)) {
                    version = aPackage.getSpecificationVersion();
                }
            }
        }
        if (version == null) {
            Enumeration<URL> resources = null;
            try {
                resources = aClass.getClassLoader().getResources("META-INF/MANIFEST.MF");
            } catch (IOException e) {
                // ignore
            }
            if (resources != null) {
                String expectedBundleName = groupId + "." + artifactId;
                while (resources.hasMoreElements()) {
                    try {
                        Manifest manifest = new Manifest(resources.nextElement().openStream());
                        Attributes attributes = manifest.getMainAttributes();
                        String bundleName = attributes.getValue("Bundle-SymbolicName");
                        if (Objects.equals(expectedBundleName, bundleName)) {
                            version = attributes.getValue("Implementation-Version");
                            if (Strings.isNotBlank(version)) break;
                        }
                    } catch (IOException e) {
                        // ignore
                    }
                }
            }
        }
        return version;
    }
}
