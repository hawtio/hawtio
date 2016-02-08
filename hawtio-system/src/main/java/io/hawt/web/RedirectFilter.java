package io.hawt.web;

import java.io.IOException;
import java.util.regex.Pattern;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RedirectFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(RedirectFilter.class);

    private static final String knownServlets[] = {"jolokia", "auth", "upload", "javadoc", "proxy", "springBatch", "user", "plugin", "exportContext", "contextFormatter", "refresh"};

    private ServletContext context;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        context = filterConfig.getServletContext();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        if (servletRequest instanceof HttpServletRequest
                && servletResponse instanceof HttpServletResponse) {
            process((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
        } else {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    private void process(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        String uri = request.getRequestURI();
        if (uri.startsWith("/")) {
            uri = uri.substring(1);
        }
        if (uri.endsWith("/")) {
            uri = uri.substring(0, uri.length() - 1);
        }
        String[] uriParts = Pattern.compile("/").split(uri);
        // pass along if it's the top-level context
        if (uriParts.length == 1) {
            chain.doFilter(request, response);
            return;
        }
        String myContext = uriParts[0];
        // pass along (hopefully) any files
        String lastPart = uriParts[uriParts.length - 1];
        if (lastPart.contains(".") && !lastPart.endsWith(".profile")) {
            // TODO if we get a 404 and we know its not a standard
            // file like a .css / .js / image then should we still
            // return the index.html?
            // e.g. what if we are viewing a properties file inside the wiki?
            chain.doFilter(request, response);
            return;
        }
        // pass along requests for our known servlets
        String subContext = uriParts[1];
        for (String knownServlet : knownServlets) {
            if (knownServlet.equals(subContext)) {
                chain.doFilter(request, response);
                return;
            }
        }
        String route = "";
        for (String part : uriParts) {
            if (!part.equals(myContext)) {
                route = route + "/" + part;
            }
        }
        // if we've gotten here, we need to just return index.html
        LOG.debug("Accessing {}, which isn't valid, returning index.html", request.getRequestURI());
        String path = request.getRequestURI();
        String context = request.getContextPath();
        path = path.substring(context.length());
        String qs = request.getQueryString();

        response.sendRedirect(request.getContextPath() + "/#" + path + (qs != null && !"".equals(qs) ? "?" + qs : ""));
    }

    @Override
    public void destroy() {
        // noop
    }
}
