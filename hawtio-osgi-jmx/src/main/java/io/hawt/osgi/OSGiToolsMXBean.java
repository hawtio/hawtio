package io.hawt.osgi;

public interface OSGiToolsMXBean {
    /**
     * Returns from what bundle the given class was loaded, when loaded in the context of another bundle
     * @param bundleID The bundle to load the class from.
     * @param clazz The class name to load.
     * @return The bundle that served the class or -1 if the class could not be loaded.
     * @throws IllegalArgumentException if an invalid bundle ID is provided.
     */
    long getLoadClassOrigin(long bundleID, String clazz);
}
