package io.hawt.quarkus;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

/**
 * Forwards all Angular route URLs to index.html.
 *
 * Ignores jolokia paths and other Hawtio resources.
 */
public class HawtioQuarkusPathFilter implements Filter  {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI().substring(HawtioConfig.DEFAULT_CONTEXT_PATH.length());
        if (path.matches("^/(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|user|oauth|plugins|\\.).)*")) {
            chain.doFilter(request, response);
            httpRequest.getRequestDispatcher(HawtioConfig.DEFAULT_CONTEXT_PATH + "/index.html").forward(request, response);
        } else {
            chain.doFilter(request, response);
        }
    }
}
