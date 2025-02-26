package io.hawt.connect;

import java.io.IOException;
import java.util.Optional;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.web.ServletHelpers;
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
        ServletHelpers.sendJSONResponse(resp, connections);
    }
}
