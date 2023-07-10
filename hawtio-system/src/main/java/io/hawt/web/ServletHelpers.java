package io.hawt.web;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URL;

import javax.management.AttributeNotFoundException;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.system.Authenticator;
import io.hawt.util.IOHelper;
import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helpers for servlet
 */
public class ServletHelpers {

    protected static final String HEADER_HAWTIO_FORBIDDEN_REASON = "Hawtio-Forbidden-Reason";

    private static final Logger LOG = LoggerFactory.getLogger(ServletHelpers.class);

    private static final String HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";

    public static void doForbidden(HttpServletResponse response) {
        doForbidden(response, ForbiddenReason.NONE);
    }

    public static void doForbidden(HttpServletResponse response, ForbiddenReason reason) {
        try {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentLength(0);
            response.setHeader(HEADER_HAWTIO_FORBIDDEN_REASON, reason.name());
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send forbidden response: {}", ioe.toString());
        }
    }

    public static void doAuthPrompt(String realm, HttpServletResponse response) {
        // request authentication
        try {
            response.setHeader(HEADER_WWW_AUTHENTICATE, Authenticator.AUTHENTICATION_SCHEME_BASIC + " realm=\"" + realm + "\"");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send auth response: {}", ioe.toString());
        }
    }

    public static void sendJSONResponse(HttpServletResponse response, boolean value) throws IOException {
        sendJSONResponse(response, String.valueOf(value));
    }

    public static void sendJSONResponse(HttpServletResponse response, String json) throws IOException {
        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();
        writer.println(json);
        writer.flush();
        writer.close();
    }

    public static JSONObject readObject(BufferedReader reader) throws IOException {
        String data = IOHelper.readFully(reader);
        return new JSONObject(data);
    }

    public static void writeEmpty(PrintWriter out) {
        out.write("{}");
        out.flush();
        out.close();
    }

    public static void writeObject(Converters converters, JsonConvertOptions options, PrintWriter out, Object data) {
        Object result = null;

        try {
            result = converters.getToJsonConverter().convertToJson(data, null, options);
        } catch (AttributeNotFoundException e) {
            LOG.warn("Failed to convert object to json", e);
        }

        if (result != null) {
            out.write(result.toString());
            out.flush();
            out.close();
        } else {
            writeEmpty(out);
        }
    }

    public static InputStream loadFile(String path) {
        if (path.startsWith("classpath:")) {
            String classPathLocation = path.substring(10);
            InputStream is = ServletHelpers.class.getClassLoader().getResourceAsStream(classPathLocation);
            if (is != null) {
                return is;
            }
            // Quarkus dev mode requires thread context classloader
            // https://github.com/quarkusio/quarkus/issues/2531
            return Thread.currentThread().getContextClassLoader().getResourceAsStream(classPathLocation);
        }
        try {
            if (!path.contains(":")) {
                //assume file protocol
                path = "file://" + path;
            }
            return new URL(path).openStream();
        } catch (Exception e) {
            LOG.warn("Couldn't find file on location: {}", path);
            LOG.debug("Couldn't find file", e);
            return null;
        }
    }
}
