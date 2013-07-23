package io.hawt.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author Stan Lewis
 */
public class AuthenticationServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthenticationServlet.class);

    private String realm;
    private String role;

    @Override
    public void init(ServletConfig config) throws ServletException {

        realm = (String) config.getServletContext().getAttribute("realm");
        role = (String) config.getServletContext().getAttribute("role");

        LOG.info("Starting hawtio authentication servlet, authentication realm: \"" + realm + "\" authorized role: \"" + role + "\"");

        super.init(config);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        super.doPost(req, resp);

    }
}
