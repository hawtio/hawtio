package io.hawt.web.plugin.karaf.terminal;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.InterruptedIOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.io.PrintStream;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.karaf.shell.api.console.Session;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.system.Helpers;
import io.hawt.web.LoginTokenServlet;

/**
 *
 */
public class TerminalServlet extends HttpServlet {

    public static final int TERM_WIDTH = 120;
    public static final int TERM_HEIGHT = 39;
    private final static Logger LOG = LoggerFactory.getLogger(TerminalServlet.class);

    private static String KARAF4_FACTORY = "io.hawt.web.plugin.karaf.terminal.karaf4.Karaf4ConsoleFactory";
    private volatile KarafConsoleFactory factory;

    /**
     * Pseudo class version ID to keep the IDE quite.
     */
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String token = request.getHeader(LoginTokenServlet.LOGIN_TOKEN);

        if (token == null || session == null) {
            Helpers.doForbidden(response);
            return;
        }

        String sessionToken = (String) session.getAttribute(LoginTokenServlet.LOGIN_TOKEN);
        if (sessionToken == null || !token.equals(sessionToken)) {
            session.invalidate();
            Helpers.doForbidden(response);
            return;
        }

        String encoding = request.getHeader("Accept-Encoding");
        boolean supportsGzip = (encoding != null && encoding.toLowerCase().contains("gzip"));
        SessionTerminal st = null;
        try {
            st = (SessionTerminal) session.getAttribute("terminal");
        } catch (Exception e) {
            // ignore as we create a new session
        }
        if (st == null || st.isClosed()) {
            st = new SessionTerminal();
            // ensure to create a session as it was closed
            session = request.getSession(true);
            session.setAttribute(LoginTokenServlet.LOGIN_TOKEN, token);
            session.setAttribute("terminal", st);
        }

        String str = request.getParameter("k");
        String f = request.getParameter("f");
        String dump = st.handle(str, f != null && f.length() > 0);
        if (dump != null) {
            if (supportsGzip) {
                response.setHeader("Content-Encoding", "gzip");
                response.setHeader("Content-Type", "text/html");
                try {
                    GZIPOutputStream gzos = new GZIPOutputStream(response.getOutputStream());
                    gzos.write(dump.getBytes());
                    gzos.close();
                } catch (IOException ie) {
                    LOG.info("Exception writing response: ", ie);
                }
            } else {
                response.getOutputStream().write(dump.getBytes());
            }
        }
    }

    private BundleContext getBundleContext() {
        BundleContext bundleContext = null;
        Bundle currentBundle = FrameworkUtil.getBundle(getClass());
        if (currentBundle != null) {
            bundleContext = currentBundle.getBundleContext();
        }
        return bundleContext;
    }

    Object createSession(PipedInputStream in,
                         PrintStream pipedOut,
                         BundleContext bundleContext) throws Exception {

        Object answer = null;

        // first time we need to see if its karaf 4 or something else
        if (factory == null) {
            try {
                // need to load class dynamic so we dont have compile time imports
                factory = (KarafConsoleFactory) bundleContext.getBundle().loadClass(KARAF4_FACTORY).newInstance();
                answer = factory.createConsole(in, pipedOut, bundleContext);
            } catch (Throwable e) {
                // ignore
                LOG.debug("Cannot create console using Karaf4 due " + e.getMessage());
            }
        } else {
            answer = factory.createConsole(in, pipedOut, bundleContext);
        }

        if (answer == null) {
            throw new IllegalArgumentException("Cannot create console for terminal");
        }

        return answer;
    }

    public class SessionTerminal implements Runnable {

        private Terminal terminal;
        private Session session;
        private PipedOutputStream in;
        private PipedInputStream out;
        private boolean closed;

        public SessionTerminal() throws IOException {
            try {
                this.terminal = new Terminal(TERM_WIDTH, TERM_HEIGHT);

                in = new PipedOutputStream();
                out = new PipedInputStream();
                PrintStream pipedOut = new PrintStream(new PipedOutputStream(out), true);

                session = (Session) createSession(new PipedInputStream(in), pipedOut, getBundleContext());
                session.put("APPLICATION", System.getProperty("karaf.name", "root"));
                // TODO: user should likely be the logged in user, eg we can grab that from the user servlet
                session.put("USER", "karaf");
                session.put("COLUMNS", Integer.toString(TERM_WIDTH));
                session.put("LINES", Integer.toString(TERM_HEIGHT));
            } catch (IOException e) {
                LOG.info("Exception attaching to console", e);
                throw e;
            } catch (Exception e) {
                LOG.info("Exception attaching to console", e);
                throw (IOException) new IOException().initCause(e);
            }
            new Thread((Runnable) session).start();
            new Thread(this).start();
        }

        public boolean isClosed() {
            return closed;
        }

        public void close() {
            factory.close(session, true);
        }

        public String handle(String str, boolean forceDump) throws IOException {
            try {
                if (str != null && str.length() > 0) {
                    String d = terminal.pipe(str);
                    for (byte b : d.getBytes()) {
                        in.write(b);
                    }
                    in.flush();
                }
            } catch (IOException e) {
                closed = true;
                throw e;
            }
            try {
                return terminal.dump(10, forceDump);
            } catch (InterruptedException e) {
                throw new InterruptedIOException(e.toString());
            }
        }

        public void run() {
            try {
                for (; ; ) {
                    byte[] buf = new byte[8192];
                    int l = out.read(buf);
                    InputStreamReader r = new InputStreamReader(new ByteArrayInputStream(buf, 0, l));
                    StringBuilder sb = new StringBuilder();
                    for (; ; ) {
                        int c = r.read();
                        if (c == -1) {
                            break;
                        }
                        sb.append((char) c);
                    }
                    if (sb.length() > 0) {
                        terminal.write(sb.toString());
                    }
                    String s = terminal.read();
                    if (s != null && s.length() > 0) {
                        for (byte b : s.getBytes()) {
                            in.write(b);
                        }
                    }
                }
            } catch (IOException e) {
                closed = true;
            }
        }

    }
}
