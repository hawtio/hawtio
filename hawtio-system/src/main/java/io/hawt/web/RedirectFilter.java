package io.hawt.web;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RedirectFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(RedirectFilter.class);

    private static final String knownServlets[] = {"jolokia", "auth", "upload", "javadoc", "proxy", "springBatch", "user", "plugin", "exportContext", "contextFormatter"};

    private ServletContext context;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        context = filterConfig.getServletContext();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        if (servletRequest instanceof HttpServletRequest
            && servletResponse instanceof HttpServletResponse) {
            process((HttpServletRequest)servletRequest, (HttpServletResponse)servletResponse, filterChain);
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
        if (lastPart.contains(".")) {
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
        LOG.info("Accessing {}, which isn't valid, returning index.html", request.getRequestURI());
        OutputStream out = response.getOutputStream();
        InputStream indexHtml = context.getResourceAsStream("/index.html");
        IOUtils.copy(indexHtml, out);
        out.flush();
        out.close();
    }

    @Override
    public void destroy() {

    }
}
