package io.hawt.quarkus.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import io.hawt.quarkus.HawtioConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Forwards all React router route URLs to index.html.
 * <p>
 * Ignores jolokia paths and other Hawtio resources.
 */
public class HawtioQuarkusPathFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioQuarkusPathFilter.class);

    private final String FILTERED_PATH_PATTERN = "^/(?:(?!\\bjolokia\\b|auth|proxy|keycloak|css|fonts|img|js|user|oauth|plugins|static|\\.).)*";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI().substring(HawtioConfig.DEFAULT_CONTEXT_PATH.length());
        if (path.matches(FILTERED_PATH_PATTERN)) {
            LOG.debug("path = {} -- matched", path);
            httpRequest.getRequestDispatcher(HawtioConfig.DEFAULT_CONTEXT_PATH + "/index.html").forward(request, response);
        } else {
            LOG.debug("path = {} -- not matched", path);
            chain.doFilter(request, response);
        }
    }
}
