package io.hawt.junit;

import io.hawt.util.MBeanSupport;
import io.hawt.util.Objects;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * A facade for the hawtio configuration features.
 */
public class JUnitFacade extends MBeanSupport implements JUnitFacadeMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(JUnitFacade.class);
    private static JUnitFacade singleton;

    private String configDir;
    private String version;

    public static JUnitFacade getSingleton() {
        if (singleton == null) {
            LOG.warn("No JUnitFacade constructed yet so using default configuration for now");
            singleton = new JUnitFacade();
        }
        return singleton;
    }

    @Override
    public void init() throws Exception {
        JUnitFacade.singleton = this;
        super.init();
    }

    @Override
    protected String getDefaultObjectName() {
        return "io.hawt.junit:type=JUnitFacade";
    }

}