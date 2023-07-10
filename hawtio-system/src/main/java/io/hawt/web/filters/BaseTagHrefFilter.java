package io.hawt.web.filters;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import javax.annotation.Nonnull;
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

    private static final Logger LOG = LoggerFactory.getLogger(BaseTagHrefFilter.class);

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
        LOG.debug("baseTagHref = {}", baseTagHref);

        if (baseTagHref.equals(DEFAULT_CONTEXT_PATH)) {
            filterChain.doFilter(request, response);
            return;
        }

        final BaseTagHrefResponseWrapper responseWrapper = new BaseTagHrefResponseWrapper((HttpServletResponse) response);
        filterChain.doFilter(request, responseWrapper);

        final ServletOutputStream out = response.getOutputStream();
        final String contentType = response.getContentType();
        final byte[] content = responseWrapper.getData();

        if (contentType == null || !contentType.startsWith("text/html")) {
            out.write(content);
            return;
        }

        final byte[] replacedContent = replaceHrefs(content, baseTagHref, responseWrapper);
        responseWrapper.setContentLength(replacedContent.length);
        out.write(replacedContent);
    }

    private static byte[] replaceHrefs(byte[] content, String href, ServletResponse response) throws UnsupportedEncodingException {
        if (!href.endsWith("/")) {
            href += "/";
        }
        String encoding = Optional.ofNullable(response.getCharacterEncoding()).orElse(StandardCharsets.UTF_8.name());
        String original = new String(content, encoding);
        String replaced = original.replaceAll(
            String.format("(src|href)=(['\"])%s/", DEFAULT_CONTEXT_PATH),
            String.format("$1=$2%s", href));
        LOG.trace("Original:\n{}", original);
        LOG.trace("Replaced:\n{}", replaced);
        return replaced.getBytes(encoding);
    }

    @Override
    public void destroy() {
    }

    private static class FilterServletOutputStream extends ServletOutputStream {

        private final DataOutputStream stream;

        public FilterServletOutputStream(OutputStream output) {
            stream = new DataOutputStream(output);
        }

        @Override
        public void write(int b) throws IOException {
            stream.write(b);
        }

        @Override
        public void write(@Nonnull byte[] b) throws IOException {
            stream.write(b);
        }

        @Override
        public void write(@Nonnull byte[] b, int off, int len) throws IOException {
            stream.write(b, off, len);
        }

        @Override
        public boolean isReady() {
            return false;
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {
        }
    }

    private static class BaseTagHrefResponseWrapper extends HttpServletResponseWrapper {
        private final ByteArrayOutputStream output;

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
