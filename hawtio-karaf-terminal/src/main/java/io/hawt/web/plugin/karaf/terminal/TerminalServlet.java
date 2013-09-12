package io.hawt.web.plugin.karaf.terminal;

import org.apache.felix.service.command.CommandProcessor;
import org.apache.karaf.webconsole.gogo.GogoPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @author Stan Lewis
 */
public class TerminalServlet extends GogoPlugin {

    private final static Logger LOG = LoggerFactory.getLogger(TerminalServlet.class);

    @Override
    public void setCommandProcessor(CommandProcessor commandProcessor) {
        LOG.info("Setting command processor: {}", commandProcessor);
        super.setCommandProcessor(commandProcessor);
    }

    @Override
    protected PrintWriter startResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setCharacterEncoding( "utf-8" ); //$NON-NLS-1$
        response.setContentType( "text/html" ); //$NON-NLS-1$

        final PrintWriter pw = response.getWriter();
        return pw;
    }

    @Override
    protected void renderTopNavigation(HttpServletRequest request, PrintWriter pw) {
        return;
    }

}
