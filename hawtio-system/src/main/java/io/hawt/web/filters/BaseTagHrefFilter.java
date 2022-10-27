package io.hawt.web.filters;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BaseTagHrefFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(BaseTagHrefFilter.class);

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
        LOG.trace("Applying {}", getClass().getSimpleName());

        // For Spring Boot we need to append the context path of the hawtio application
        String baseTagHref = basePath + applicationContextPath;

        if (baseTagHref.equals(DEFAULT_CONTEXT_PATH)) {
            filterChain.doFilter(request, response);
        } else {
            final BaseTagHrefResponseWrapper responseWrapper = new BaseTagHrefResponseWrapper((HttpServletResponse) response);
            filterChain.doFilter(request, responseWrapper);

            final ServletOutputStream out = response.getOutputStream();
            final String contentType = response.getContentType();
            final byte[] data = responseWrapper.getData();

            if (contentType != null && contentType.startsWith("text/html")) {
                if (!baseTagHref.endsWith("/")) {
                    baseTagHref += "/";
                }

                final String characterEncoding = responseWrapper.getCharacterEncoding() != null ? responseWrapper.getCharacterEncoding() : StandardCharsets.UTF_8.name();
                final String originalContent = new String(data, characterEncoding);
                final byte[] replacedContent = originalContent.replaceAll("<base href='.*?'>", "<base href='" + baseTagHref + "'>").getBytes(characterEncoding);

                responseWrapper.setContentLength(replacedContent.length);
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


    private class BaseTagHrefResponseWrapper extends HttpServletResponseWrapper {
        private ByteArrayOutputStream output;

        public BaseTagHrefResponseWrapper(HttpServletResponse response) {
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
