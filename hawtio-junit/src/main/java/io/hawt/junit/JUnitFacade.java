package io.hawt.junit;

import io.hawt.util.MBeanSupport;
import io.hawt.util.introspect.support.ClassScanner;
import org.junit.runner.JUnitCore;
import org.junit.runner.Request;
import org.junit.runner.Result;
import org.junit.runner.notification.RunListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * A facade for the hawtio configuration features.
 */
public class JUnitFacade extends MBeanSupport implements JUnitFacadeMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(JUnitFacade.class);
    private static JUnitFacade singleton;

    private String configDir;
    private String version;
    private ClassScanner classScanner = ClassScanner.newInstance();

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
        return "hawtio:type=JUnitFacade";
    }

    @Override
    public ResultDTO runTestClasses(List<String> classNames) throws Exception {
        JUnitCore core = new JUnitCore();
        core.addListener(new RunListener() {
        });
        List<Class<?>> classes = classScanner.optionallyFindClasses(classNames);
        Class<?>[] classArray = new Class<?>[classes.size()];
        classes.toArray(classArray);
        Request request = Request.classes(classArray);
        Result result = core.run(request);
        return new ResultDTO(result);
    }
}