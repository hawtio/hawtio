package io.hawt.log.support;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.security.CodeSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A helper class for finding the maven coordinates
 */
public class MavenCoordHelper {
    private static final Logger LOG = LoggerFactory.getLogger(MavenCoordHelper.class);
    // TODO need to have one of these per class loader ideally
    private static final Map<String, String> classToMavenCoordMap = new ConcurrentHashMap<>();

    public static String getMavenCoordinates(String className) {
        String coordinates = null;
        if (!Objects.isBlank(className)) {
            coordinates = classToMavenCoordMap.get(className);
            if (coordinates == null) {
                try {
                    Class<?> cls = findClass(className);
                    coordinates = getMavenCoordinates(cls);
                } catch (Throwable t) {
                    LOG.debug("Can't find maven coordinate for " + className);
                }
            }
        }
        return coordinates;
    }

    public static String getMavenCoordinates(Class<?> cls) throws IOException {
        StringBuilder buffer = new StringBuilder();
        try {
            CodeSource source = cls.getProtectionDomain().getCodeSource();
            if (source != null) {
                URL locationURL = source.getLocation();
                if (locationURL != null) {
                    // lets try find the pom.properties file...

                    //
                    //   if a file: URL
                    //
                    if ("file".equals(locationURL.getProtocol())) {
                        String path = locationURL.getPath();
                        if (path != null) {
                            File file = new File(path);
                            if (file.exists() && !file.isDirectory()) {
                                String coordinates = MavenCoordinates.mavenCoordinatesFromJarFile(file);
                                if (!Objects.isBlank(coordinates)) {
                                    return coordinates;
                                }
                            }
                            //
                            //  find the last file separator character
                            //
                            int lastSlash = path.lastIndexOf('/');
                            int lastBack = path.lastIndexOf(File.separatorChar);
                            if (lastBack > lastSlash) {
                                lastSlash = lastBack;
                            }
                            //
                            //  if no separator or ends with separator (a directory)
                            //     then output the URL, otherwise just the file name.
                            //
                            if (lastSlash <= 0 || lastSlash == path.length() - 1) {
                                buffer.append(locationURL);
                            } else {
                                buffer.append(path.substring(lastSlash + 1));
                            }
                        }
                    } else {
                        buffer.append(locationURL);
                    }
                }
            }
        } catch (SecurityException ignored) {
        }
        buffer.append(':');
        Package pkg = cls.getPackage();
        if (pkg != null) {
            String implVersion = pkg.getImplementationVersion();
            if (implVersion != null) {
                buffer.append(implVersion);
            }
        }
        return buffer.toString();
    }

    /**
     * Find class given class name.
     *
     * @param className class name, may not be null.
     * @return class, will not be null.
     * @throws ClassNotFoundException thrown if class can not be found.
     */
    protected static Class<?> findClass(final String className) throws ClassNotFoundException {
        try {
            return Thread.currentThread().getContextClassLoader().loadClass(className);
        } catch (ClassNotFoundException e) {
            try {
                return Class.forName(className);
            } catch (ClassNotFoundException e1) {
                return MavenCoordHelper.class.getClassLoader().loadClass(className);
            }
        }
    }
}
