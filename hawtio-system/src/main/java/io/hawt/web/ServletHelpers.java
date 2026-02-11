package io.hawt.web;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URL;
import javax.management.AttributeNotFoundException;

import io.hawt.web.auth.SessionExpiryFilter;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.system.Authenticator;
import io.hawt.util.IOHelper;
import org.jolokia.core.service.serializer.SerializeOptions;
import org.jolokia.json.parser.JSONParser;
import org.jolokia.json.parser.ParseException;
import org.jolokia.service.serializer.JolokiaSerializer;
import org.jolokia.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helpers for servlet
 */
public class ServletHelpers {

    private static final Logger LOG = LoggerFactory.getLogger(ServletHelpers.class);

    protected static final String HEADER_HAWTIO_FORBIDDEN_REASON = "Hawtio-Forbidden-Reason";
    private static final String HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";
    private static final String HEADER_RETRY_AFTER = "Retry-After";

    private static final JolokiaSerializer SERIALIZER = new JolokiaSerializer();

    public static void doForbidden(HttpServletResponse response) {
        doForbidden(response, ForbiddenReason.NONE);
    }

    public static void doForbidden(HttpServletResponse response, ForbiddenReason reason) {
        try {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setHeader(HEADER_HAWTIO_FORBIDDEN_REASON, reason.name());
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send forbidden response: {}", ioe.toString());
        }
    }

    public static void doAuthPrompt(HttpServletResponse response, String realm) {
        // request authentication
        try {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader(HEADER_WWW_AUTHENTICATE, Authenticator.AUTHENTICATION_SCHEME_BASIC + " realm=\"" + realm + "\"");
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send auth response: {}", ioe.toString());
        }
    }

    public static void doTooManyRequests(HttpServletResponse response, long retryAfter) {
        try {
            // HTTP status code: 429 Too Many Requests
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
            response.setStatus(429);
            response.setHeader(HEADER_RETRY_AFTER, Long.toString(retryAfter));
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send throttling response: {}", ioe.toString());
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
        try {
            return (JSONObject) new JSONParser().parse(data);
        } catch (ParseException e) {
            throw new IOException(e.getMessage(), e);
        }
    }

    public static void writeEmpty(PrintWriter out) {
        out.write("{}");
        out.flush();
        out.close();
    }

    public static void writeObjectAsJson(PrintWriter out, Object data) {
        Object result = null;

        try {
            result = SERIALIZER.serialize(data, null, SerializeOptions.DEFAULT);
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
            if (!path.startsWith("file:")) {
                // assume file protocol
                path = new File(path).toURI().toString();
            }
            return new URL(path).openStream();
        } catch (Exception e) {
            LOG.debug("Couldn't find file: {}", path);
            return null;
        }
    }

    /**
     * Strip out unwanted characters from the header such a CR/LF chars
     */
    public static String sanitizeHeader(String header) {
        if (header == null) {
            return null;
        }
        return header.replaceAll("[\\r\\n]", "");
    }

    /**
     * Normalizes a path. If the path contains a single '/' character it is returned
     * unchanged, otherwise the path is:
     * <ol>
     * <li>stripped from all multiple consecutive occurrences of '/' characters</li>
     * <li>stripped from trailing '/' character(s)</li>
     * </ol>
     *
     * @param path
     *            path to normalize
     * @return normalized path
     */
    public static String cleanPath(final String path) {
        final String result = path.replaceAll("//+", "/");
        return result.length() == 1 && result.charAt(0) == '/' ? result
                : result.replaceAll("/+$", "");
    }

    /**
     * Creates a web context path from components. Concatenates all path components
     * using '/' character as delimiter and the result is then:
     * <ol>
     * <li>prefixed with '/' character</li>
     * <li>stripped from all multiple consecutive occurrences of '/' characters</li>
     * <li>stripped from trailing '/' character(s)</li>
     * </ol>
     *
     * @return empty string or string which starts with a "/" character but does not
     *         end with a "/" character
     */
    public static String webContextPath(final String first, final String... more) {
        if (more.length == 0 && (first == null || first.isEmpty())) {
            return "";
        }

        final StringBuilder b = new StringBuilder();
        if (first != null) {
            if (!first.startsWith("/")) {
                b.append('/');
            }
            b.append(first);
        }

        for (final String s : more) {
            if (s != null && !s.isEmpty()) {
                b.append('/');
                b.append(s);
            }
        }

        final String cleanedPath = cleanPath(b.toString());
        return cleanedPath.length() == 1 ? "" : cleanedPath;
    }

    /**
     * Return a number of web path segments that need to be skipped to reach <em>hawtio path</em>. In JakartaEE
     * environment (WAR) everything after context path is "hawtio path", so {@code 0} is returned. In Spring Boot
     * we may have to skip some segments (like {@code /actuator/hawtio}).
     *
     * @param servletContext
     * @return
     */
    public static int hawtioPathIndex(ServletContext servletContext) {
        String servletPath = (String) servletContext.getAttribute(SessionExpiryFilter.SERVLET_PATH);
        if (servletPath == null) {
            // this attribute is set only in non JakartaEE environments, so here we are in standard WAR
            // deployment. Just return "0", which means full path without initial context path
            return 0;
        } else {
            // when SessionExpiryFilter.SERVLET_PATH is set, it contains prefix which should be skipped and which
            // is not standard JakartaEE path components (context path, servlet path, path info).
            // for Spring Boot we have to skip dispatcher servlet path, management endpoints base ("/actuator")
            // and management endpoint mapping
            String cleanPath = webContextPath(servletPath);
            int pathIndex = 0;
            // for "/actuator/hawtio", we have to return "2", so count slashes
            for (char c : cleanPath.toCharArray()) {
                if (c == '/') {
                    pathIndex++;
                }
            }
            return pathIndex;
        }
    }

}
