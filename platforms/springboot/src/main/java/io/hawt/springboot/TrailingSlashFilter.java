package io.hawt.springboot;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.web.auth.Redirector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TrailingSlashFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(TrailingSlashFilter.class);

    private final Redirector redirector;

    public TrailingSlashFilter(Redirector redirector) {
        this.redirector = redirector;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        if (!httpRequest.getRequestURI().endsWith("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        redirector.doRedirect(httpRequest, httpResponse, "/index.html");
    }
}
