package io.hawt.web.auth;

import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletRequest;

import io.hawt.util.Strings;

/**
 * URI path relative to a given index. An index represents the number of path
 * components (portions of request uri separated by '/' character) preceding the
 * start of the uri. For example:
 * <p>
 * <table border="1">
 * <tr>
 * <th>&nbsp;Request URI&nbsp;</th>
 * <th>&nbsp;Path Index&nbsp;</th>
 * <th>&nbsp;Relative URI&nbsp;</th>
 * </tr>
 * <tr>
 * <td>/a/b/c</td>
 * <td>0</td>
 * <td>/a/b/c</td>
 * </tr>
 * <tr>
 * <td>/a/b/c</td>
 * <td>1</td>
 * <td>/b/c</td>
 * </tr>
 * <tr>
 * <td>/a/b/c</td>
 * <td>3</td>
 * <td>{@code (empty)}</td>
 * </tr>
 * </table>
 */
public class RelativeRequestUri {

    private static final Pattern PATH_SPLITTER = Pattern.compile("/");

    private final HttpServletRequest request;
    private final String uriPrefix;
    private final String uri;
    private final String[] uriComponents;

    /**
     * Constructor.
     * 
     * @param request
     *            HTTP request
     * @param pathIndex
     *            index of the first path component relative to a servlet root (not
     *            context root!). Path components are parts of the request uri
     *            separated by '/' with the first component (servlet root) being
     *            assigned index zero.
     * @throws IllegalArgumentException
     *             if pathIndex is negative
     */
    public RelativeRequestUri(final HttpServletRequest request,
            final int pathIndex) {
        if (pathIndex < 0) {
            throw new IllegalArgumentException("pathIndex is negative");
        }

        final String requestUri = Strings.webContextPath(request.getRequestURI());
        int start = request.getContextPath().length();
        if (start < requestUri.length() && requestUri.charAt(start) == '/') {
            start++;
        }

        if (pathIndex != 0) {
            int c = 0;
            do {
                int i = requestUri.indexOf('/', start);
                start = i + 1;
                if (start == 0) {
                    start = requestUri.length();
                    break;
                }
                c++;
            } while (c < pathIndex);
        }

        if (start < requestUri.length()) {
            this.uriPrefix = requestUri.substring(0, start);
            this.uri = requestUri.substring(start);
        } else {
            this.uriPrefix = requestUri;
            this.uri = "";
        }

        this.uriComponents = uri.isEmpty() ? new String[0]
                : PATH_SPLITTER.split(uri);
        this.request = request;
    }

    /**
     * Gets the original HTTP request.
     * 
     * @return HTTP request
     */
    public HttpServletRequest getRequest() {
        return request;
    }

    /**
     * Gets the absolute path from the context root to the start of the uri.
     * 
     * @return uri prefix
     */
    public String getPrefix() {
        return uriPrefix;
    }

    /**
     * Gets the uri.
     * 
     * @return request uri
     */
    public String getUri() {
        return uri;
    }

    /**
     * Gets components of the uri. The result is achieved by splitting request uri
     * using '/' as separator.
     * 
     * @return array of strings
     */
    public String[] getComponents() {
        return uriComponents;
    }

    /**
     * Gets the last component of request uri.
     * 
     * @return last uri component or <code>null</code> if request is empty
     */
    public String getLastComponent() {
        return uriComponents.length == 0 ? null
                : uriComponents[uriComponents.length - 1];
    }

    @Override
    public String toString() {
        return getUri();
    }
}
