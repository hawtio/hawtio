package io.hawt.connect;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Optional;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static io.hawt.connect.Connection.HAWTIO_CONNECT_PRESET_CONNECTIONS;

public class PresetConnectionsServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(PresetConnectionsServlet.class);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String connections = Optional
            .ofNullable(System.getProperty(HAWTIO_CONNECT_PRESET_CONNECTIONS))
            .orElse("[]");
        resp.setContentType("application/json");
        PrintWriter writer = resp.getWriter();
        writer.println(connections);
        writer.flush();
        writer.close();
    }
}
