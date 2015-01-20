package io.hawt.web.plugin.karaf.terminal.karaf2;

import java.io.PipedInputStream;
import java.io.PrintStream;
import java.lang.reflect.Constructor;

import io.hawt.web.plugin.karaf.terminal.KarafConsoleFactory;
import io.hawt.web.plugin.karaf.terminal.WebTerminal;
import org.apache.felix.service.command.CommandProcessor;
import org.apache.felix.service.command.CommandSession;
import org.apache.felix.service.threadio.ThreadIO;
import org.osgi.framework.BundleContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Karaf2ConsoleFactory implements KarafConsoleFactory {

    private final static Logger LOG = LoggerFactory.getLogger(Karaf2ConsoleFactory.class);

    private static final String KARAF2_CONSOLE_CLASSNAME = "org.apache.karaf.shell.console.jline.Console";

    public static final int TERM_WIDTH = 120;
    public static final int TERM_HEIGHT = 400;

    public CommandSession getSession(Object console) {
        try {
            return (CommandSession) console.getClass().getMethod("getSession", null).invoke(console);
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    public void close(Object console, boolean param) {
        try {
            console.getClass().getMethod("close", boolean.class).invoke(console, param);
        } catch (Exception e) {
            // ignore
        }
    }

    public Object createConsole(CommandProcessor commandProcessor,
                                       PipedInputStream in,
                                       PrintStream pipedOut,
                                       ThreadIO threadIO,
                                       BundleContext bundleContext) throws Exception {

        Class<?> clazz2 = null;
        try {
            clazz2 = bundleContext.getBundle().loadClass(KARAF2_CONSOLE_CLASSNAME);
        } catch (Exception e) {
            // ignore
        }

        if (clazz2 != null) {
            Constructor ctr = clazz2.getConstructors()[0];
            if (ctr.getParameterTypes().length <= 7) {
                LOG.debug("Using old Karaf 2.x Console API");

                // last parameter may be BundleContext if its redhat version of karaf
                // for ASF releases its a Runnable, and we should pass in null
                Object last = null;
                Class<?> type = ctr.getParameterTypes()[6];
                if (type != null && type.getSimpleName().equals("BundleContext")) {
                    last = bundleContext;
                }

                // the old API does not have the threadIO parameter, so its only 7 parameters
                return ctr.newInstance(commandProcessor,
                        in,
                        pipedOut,
                        pipedOut,
                        new WebTerminal(TERM_WIDTH, TERM_HEIGHT),
                        null,
                        last);
            } else {
                LOG.debug("Using new Karaf 2.x Console API");

                // last parameter may be BundleContext if its redhat version of karaf
                // for ASF releases its a Runnable, and we should pass in null
                Object last = null;
                Class<?> type = ctr.getParameterTypes()[8];
                if (type != null && type.getSimpleName().equals("BundleContext")) {
                    last = bundleContext;
                }

                // the new API has the threadIO parameter, so it has 9 parameters
                return ctr.newInstance(commandProcessor,
                        threadIO,
                        in,
                        pipedOut,
                        pipedOut,
                        new WebTerminal(TERM_WIDTH, TERM_HEIGHT),
                        null,
                        null,
                        last);
            }
        }

        return null;
    }

}
