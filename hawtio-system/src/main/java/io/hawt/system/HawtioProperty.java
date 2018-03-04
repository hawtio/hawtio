package io.hawt.system;

/**
 * Hawtio property name constants.
 */
public final class HawtioProperty {

    /**
     * Boolean flag indicating whether JNDI configuration should be skipped in
     * preference of system properties.
     */
    public static final String FORCE_PROPERTIES = "forceProperties";

    /**
     * The name of the servlet context attribute holding hawtio deployment path
     * relative to the context root. By default when hawtio is launched in
     * stand-alone mode, its path is assumed to be at the root of the servlet. But
     * in certain scenarios this might not be the case. For example, when running
     * under Spring Boot, actual hawtio path can potentially consist of servlet
     * prefix, management context path as well as hawtio endpoint path.
     */
    public static final String SERVLET_PATH = "hawtioServletPath";
}
