package io.hawt.osgi.jmx;

public interface OSGiToolsMXBean {
    /**
     * Returns from what bundle the given class was loaded, when requested in the context of a certain bundle.
     * @param bundleID The bundle to load the class from.
     * @param clazz The class name to load.
     * @return The bundle that served the class or -1 if the class could not be loaded.
     * @throws IllegalArgumentException if an invalid bundle ID is provided.
     */
    long getLoadClassOrigin(long bundleID, String clazz);

    /**
     * Returns the URL where the requested resource was found, when looked up in the context of a certain bundle.
     * @param bundleID The bundle to load the class from.
     * @param resource The resource name to load. The format is as defined in {@code ClassLoader.getResource}.
     * @return The URL where the bundle with bundleID can find the resource in String form. If the resource
     * cannot be found {@code null} is returned.
     * @throws IllegalArgumentException if an invalid bundle ID is provided.
     */
    String getResourceURL(long bundleID, String resource);
}
