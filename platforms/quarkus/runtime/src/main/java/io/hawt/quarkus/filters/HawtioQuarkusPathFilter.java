package io.hawt.quarkus.filters;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.quarkus.HawtioConfig;
import io.hawt.util.IOHelper;
import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Forwards all React router route URLs to index.html.
 * <p>
 * Ignores jolokia paths and other Hawtio resources.
 */
public class HawtioQuarkusPathFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioQuarkusPathFilter.class);

    private static final String FILTERED_PATH_PATTERN = "^/(?:(?!\\bjolokia\\b|auth|proxy|keycloak|css|fonts|img|js|user|static|\\.).)*";

    private static final String FILTERED_PATH_HAWTCONFIG = "/hawtconfig.json";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI().substring(HawtioConfig.DEFAULT_CONTEXT_PATH.length());

        // TODO: Is there a better way to handle hawtconfig.json from classpath in Quarkus?
        if (path.equals(FILTERED_PATH_HAWTCONFIG)) {
            LOG.debug("path = {} -- reading from classpath", path);
            String content = loadFromHawtioStatic(path);
            if (content != null) {
                ServletHelpers.sendJSONResponse((HttpServletResponse) response, content);
                return;
            }
        } else if (path.matches(FILTERED_PATH_PATTERN)) {
            LOG.debug("path = {} -- matched", path);
            httpRequest.getRequestDispatcher(HawtioConfig.DEFAULT_CONTEXT_PATH + "/index.html").forward(request, response);
            return;
        }

        LOG.debug("path = {} -- not matched", path);
        chain.doFilter(request, response);
    }

    // TODO: We might not need to load hawtconfig.json from hawtio-static. For Quarkus, static resources can be loaded from META-INF/resources.
    private static String loadFromHawtioStatic(String path) {
        String hawtioStaticPath = String.format("classpath:/hawtio-static%s", path);
        String sanitizedPath = sanitizeUri(path);

        if (sanitizedPath == null) {
            LOG.error("path = {} -- invalid path to resource", hawtioStaticPath);
            return null;
        }

        try (InputStream is = ServletHelpers.loadFile(sanitizedPath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(Objects.requireNonNull(is)))) {
            LOG.debug("path = {} -- classpath resource found", sanitizedPath);
            return IOHelper.readFully(reader);
        } catch (Exception e) {
            LOG.debug("path = {} -- classpath resource not found: {}", sanitizedPath, e.getMessage());
        }
        return null;
    }

    private static String sanitizeUri(String path) {
        try {
            URI uri = new URI(path);
            String cleanedPath = uri.getPath();
            return URLDecoder.decode(cleanedPath, StandardCharsets.UTF_8.name());
        } catch (UnsupportedEncodingException e) {
            LOG.error(e.getMessage(), e);
        } catch (URISyntaxException e) {
            LOG.error(e.getMessage(), e);
        }
        return null;
    }
}
