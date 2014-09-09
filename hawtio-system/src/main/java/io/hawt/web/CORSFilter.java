package io.hawt.web;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CORSFilter implements Filter {

    public CORSFilter() {
    }

    public void init(FilterConfig fConfig) throws ServletException {
    }

    public void destroy() {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (response instanceof HttpServletResponse) {
            HttpServletResponse resp = (HttpServletResponse) response;
            HttpServletRequest req = (HttpServletRequest) request;

            if (allowAny()) {
                if ("OPTIONS".equals(req.getMethod())) {
                    resp.addHeader("Access-Control-Request-Method", "GET, POST, PUT, DELETE");
                    String headers = req.getHeader("Access-Control-Request-Headers");
                    if (headers != null) {
                        resp.addHeader("Access-Control-Allow-Header", headers);
                    }
                    resp.addHeader("Access-Control-Max-Age", "" + TimeUnit.DAYS.toSeconds(1));
                }
                resp.addHeader("Access-Control-Allow-Origin", "*");
            }
        }
        chain.doFilter(request, response);
    }

    protected boolean allowAny() {
        // TODO allow configuration...
        return true;
    }
}