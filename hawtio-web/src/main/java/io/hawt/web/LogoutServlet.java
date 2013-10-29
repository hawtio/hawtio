package io.hawt.web;

import io.hawt.system.Helpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * 
 */
public class LogoutServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(LogoutServlet.class);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null) {
            Helpers.doForbidden(resp);
            return;
        }

        String username = (String) session.getAttribute("user");

        LOG.debug("Logging out user: {}", username);
        session.invalidate();
    }

}
