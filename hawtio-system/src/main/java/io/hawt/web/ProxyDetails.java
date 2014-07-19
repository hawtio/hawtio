package io.hawt.web;

import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A helper object to store the proxy location details
 */
public class ProxyDetails {
    private static final transient Logger LOG = LoggerFactory.getLogger(ProxyDetails.class);

    private String scheme = DEFAULT_SCHEME;
    private String path = "";
    private String userName;
    private String password;
    private String host;
    private String queryString = null;
    private int port = DEFAULT_PORT;

    public static final String USER_PARAM = "_user";
    public static final String PWD_PARAM = "_pwd";

    private static final int DEFAULT_PORT = 80;
    private static final String DEFAULT_SCHEME = "http";
    private static final int HTTPS_PORT = 443;
    private static final String HTTPS_SCHEME = "https";

    // Would be nicer to use named capture groups but only available in Java 7+...
    private static final Pattern pathInfoPattern = Pattern.compile("^/*(?:(.+):(.+)@)?(?:(.+)://?)?(?:([^/:]+)(?:[/:](\\d+)?))([^\\?]+).*$");

    private static final Pattern removeIgnoredHeaderNamesPattern = Pattern.compile("(^|(?<=[?&;]))(?:_user|_pwd|_url|url)=.*?($|[&;])");

    public ProxyDetails(HttpServletRequest httpServletRequest) {
        parsePathInfo(httpServletRequest.getPathInfo());

        // lets add the query parameters
        String reqQueryString = httpServletRequest.getQueryString();
        if (reqQueryString != null) {
            queryString = removeIgnoredHeaderNamesPattern.matcher(reqQueryString).replaceAll("");
        }
    }

    private void parsePathInfo(String pathInfo) {
        Matcher matcher = pathInfoPattern.matcher(pathInfo);

        if (matcher.matches()) {

            userName = matcher.group(1);
            password = matcher.group(2);

            scheme = matcher.group(3);
            if (scheme == null) {
                scheme = DEFAULT_SCHEME;
            }

            host = matcher.group(4);

            if (matcher.group(5) != null) {
                port = Integer.parseInt(matcher.group(5));
            } else {
                port = (scheme.equalsIgnoreCase(DEFAULT_SCHEME)) ? DEFAULT_PORT : HTTPS_PORT;
            }

            path = matcher.group(6);
            if (!path.startsWith("/")) {
                path = "/" + path;
            }

            // we do not support query parameters

            if (LOG.isDebugEnabled()) {
                LOG.debug("Proxying to " + getStringProxyURL() + " as user: " + userName);
            }
        }
    }

    @Override
    public String toString() {
        return "ProxyDetails{" +
                userName + "@" + getStringProxyURL()
                + "}";
    }

    public String getStringProxyURL() {
        return scheme + "://" + getHostAndPort() + path + (Strings.isBlank(queryString) ? "" : "?" + queryString) ;
    }

    public String getProxyPath() {
        return path;
    }

    public String getScheme() {
        return scheme;
    }

    public String getHost() {
        return host;
    }

    public String getHostAndPort() {
        if (scheme.equalsIgnoreCase(DEFAULT_SCHEME) && port == DEFAULT_PORT) {
            return host;
        }
        if (scheme.equalsIgnoreCase(HTTPS_SCHEME) && port == HTTPS_PORT) {
            return host;
        }
        return host + ":" + port;
    }

    public int getPort() {
        return port;
    }

    public String getUserName() {
        return userName;
    }

    public String getPassword() {
        return password;
    }

    public String getPath() {
        return path;
    }

    public boolean isValid() {
        return host != null;
    }
}
