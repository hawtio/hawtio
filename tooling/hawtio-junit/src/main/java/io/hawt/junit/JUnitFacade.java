package io.hawt.junit;

import java.io.File;
import java.util.List;

import io.hawt.util.MBeanSupport;
import io.hawt.util.introspect.support.ClassScanner;
import org.junit.runner.JUnitCore;
import org.junit.runner.Request;
import org.junit.runner.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A facade for the hawtio configuration features.
 */
public class JUnitFacade extends MBeanSupport implements JUnitFacadeMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(JUnitFacade.class);
    private static JUnitFacade singleton;
    private ClassScanner classScanner = ClassScanner.newInstance();

    private volatile InProgressDTO inProgress;

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

        // only register if we have junit tests
        if (hasJUnitTests()) {
            super.init();
        }
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=JUnitFacade";
    }

    @Override
    public boolean isTestInProgress() {
        return inProgress != null;
    }

    @Override
    public InProgressDTO inProgress() throws Exception {
        return inProgress;
    }

    @Override
    public ResultDTO runTestClasses(List<String> classNames) throws Exception {
        inProgress = new InProgressDTO();

        JUnitCore core = new JUnitCore();
        core.addListener(new InProgressRunListener(inProgress));

        List<Class<?>> classes = classScanner.optionallyFindClasses(classNames);
        Class<?>[] classArray = new Class<?>[classes.size()];
        classes.toArray(classArray);
        Request request = Request.classes(classArray);

        Result result = core.run(request);
        return new ResultDTO(result);
    }

    private boolean hasJUnitTests() {
        String annotationClassName = "org.junit.Test";

        File file = getBaseDir();
        File targetDir = new File(file, "target");
        File testClasses = new File(targetDir, "test-classes");
        return !classScanner.findClassNamesInDirectoryWithMethodAnnotatedWith(testClasses, annotationClassName).isEmpty();
    }

    private File getBaseDir() {
        String basedir = System.getProperty("basedir", ".");
        return new File(basedir);
    }


}