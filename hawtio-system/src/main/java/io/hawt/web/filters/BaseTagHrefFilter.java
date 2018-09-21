package io.hawt.web.filters;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

public class BaseTagHrefFilter implements Filter {

    public static final String PARAM_APPLICATION_CONTEXT_PATH = "applicationContextPath";
    private static final String DEFAULT_CONTEXT_PATH = "/hawtio";
    private String applicationContextPath;
    private String basePath;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        final String path = filterConfig.getInitParameter(PARAM_APPLICATION_CONTEXT_PATH);
        applicationContextPath = path != null ? path : "";

        final ServletContext context = filterConfig.getServletContext();
        final String contextPath = context.getContextPath();
        if (contextPath == null || contextPath.isEmpty()) {
            if (!applicationContextPath.startsWith("/")) {
                basePath = "/";
            } else {
                basePath = "";
            }
        } else {
            basePath = contextPath;
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        // For Spring Boot we need to append the context path of the hawtio application
        String baseTagHref = basePath + applicationContextPath;

        if (baseTagHref.equals(DEFAULT_CONTEXT_PATH)) {
            filterChain.doFilter(request, response);
        } else {
            final BaseTagHrefRequestWrapper requestWrapper = new BaseTagHrefRequestWrapper((HttpServletResponse) response);
            filterChain.doFilter(request, requestWrapper);

            final ServletOutputStream out = response.getOutputStream();
            final String contentType = response.getContentType();
            final byte[] data = requestWrapper.getData();

            if (contentType != null && contentType.startsWith("text/html")) {
                if (!baseTagHref.endsWith("/")) {
                    baseTagHref += "/";
                }

                final String characterEncoding = requestWrapper.getCharacterEncoding() != null ? requestWrapper.getCharacterEncoding() : StandardCharsets.UTF_8.name();
                final String originalContent = new String(data, characterEncoding);
                final byte[] replacedContent = originalContent.replaceAll("<base href='.*?'>", "<base href='" + baseTagHref + "'>").getBytes(characterEncoding);

                requestWrapper.setContentLength(replacedContent.length);
                out.write(replacedContent);
            } else {
                out.write(data);
            }
        }
    }

    @Override
    public void destroy() {
    }

    private class FilterServletOutputStream extends ServletOutputStream {

        private DataOutputStream stream;

        public FilterServletOutputStream(OutputStream output) {
            stream = new DataOutputStream(output);
        }

        @Override
        public void write(int b) throws IOException  {
            stream.write(b);
        }

        @Override
        public void write(byte[] b) throws IOException  {
            stream.write(b);
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException  {
            stream.write(b,off,len);
        }

        @Override
        public boolean isReady() {
            return false;
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {
        }
    }


    private class BaseTagHrefRequestWrapper extends HttpServletResponseWrapper {
        private ByteArrayOutputStream output;

        public BaseTagHrefRequestWrapper(HttpServletResponse response) {
            super(response);
            output = new ByteArrayOutputStream();
        }

        public byte[] getData() {
            return output.toByteArray();
        }

        public ServletOutputStream getOutputStream() {
            return new FilterServletOutputStream(output);
        }

        public PrintWriter getWriter() {
            return new PrintWriter(getOutputStream(), true);
        }
    }
}
