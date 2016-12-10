package io.hawt.web.plugin.karaf.terminal.karaf4;

import java.io.PipedInputStream;
import java.io.PrintStream;

import org.apache.karaf.shell.api.console.Session;
import org.apache.karaf.shell.api.console.SessionFactory;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.web.plugin.karaf.terminal.JLineTerminal;
import io.hawt.web.plugin.karaf.terminal.KarafConsoleFactory;
import io.hawt.web.plugin.karaf.terminal.WebTerminal;

public class Karaf4ConsoleFactory implements KarafConsoleFactory {

    private final static Logger LOG = LoggerFactory.getLogger(Karaf4ConsoleFactory.class);

    private static final String KARAF4_SESSION_FACTORY = "org.apache.karaf.shell.api.console.SessionFactory";

    public static final int TERM_WIDTH = 120;
    public static final int TERM_HEIGHT = 400;

    public void close(Object console, boolean param) {
        try {
            console.getClass().getMethod("close", boolean.class).invoke(console, param);
        } catch (Exception e) {
            // ignore
        }
    }

    public Object createConsole(PipedInputStream in,
                                PrintStream pipedOut,
                                BundleContext bundleContext) throws Exception {


        LOG.debug("Using Karaf 4.0.7 Console API");
        ServiceReference sessionFactoryRef = bundleContext.getServiceReference(KARAF4_SESSION_FACTORY);
        
        if(sessionFactoryRef != null) {
        	SessionFactory factory = (SessionFactory) bundleContext.getService(sessionFactoryRef);
        	Session session  = factory.create(in, pipedOut, pipedOut, new JLineTerminal(new WebTerminal(TERM_WIDTH, TERM_HEIGHT),"xterm"), null,null);
        	return session;
        }

        return null;
    }

}
