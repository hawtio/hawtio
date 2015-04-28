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
public class ProxyDetails implements ProxyAddress {
    private static final transient Logger LOG = LoggerFactory.getLogger(ProxyDetails.class);

    private boolean invalid;
    private String scheme = DEFAULT_SCHEME;
    private String path = "";
    private String userName;
    private String password;
    private String host;
    private String queryString = null;
    private int port = DEFAULT_PORT;

    private static final int DEFAULT_PORT = 80;
    private static final String DEFAULT_SCHEME = "http";
    private static final int HTTPS_PORT = 443;
    private static final String HTTPS_SCHEME = "https";

    private static final Pattern pathInfoPattern = Pattern.compile("^(?:\\/*(?:(?<scheme>[^:]+):\\/\\/?)?(?:(?<username>[^:]+):(?<password>.*)@)?)?(?<host>[^\\/]+)(?:[\\/:](?<port>\\d+)?)(?<path>[^\\?]+).*$");

    private static final Pattern removeIgnoredHeaderNamesPattern = Pattern.compile("(^|(?<=[?&;]))(?:_user|_pwd|_url|url)=.*?($|[&;])");

    public ProxyDetails(HttpServletRequest httpServletRequest) {
        parsePathInfo(httpServletRequest.getPathInfo());

        // lets add the query parameters
        String reqQueryString = httpServletRequest.getQueryString();
        if (reqQueryString != null) {
            queryString = removeIgnoredHeaderNamesPattern.matcher(reqQueryString).replaceAll("");
        }
    }

    public ProxyDetails(String scheme, String path, String userName, String password, String host, String queryString, int port) {
        this.scheme = scheme;
        this.path = path;
        this.userName = userName;
        this.password = password;
        this.host = host;
        this.queryString = queryString;
        this.port = port;
    }

    private void parsePathInfo(String pathInfo) {
        // skip empty path
        if (Strings.isBlank(pathInfo)) {
            invalid = true;
            return;
        }

        Matcher matcher = pathInfoPattern.matcher(pathInfo);

        if (matcher.matches()) {

            userName = matcher.group("username");
            password = matcher.group("password");

            scheme = matcher.group("scheme");
            if (scheme == null) {
                scheme = DEFAULT_SCHEME;
            }

            host = matcher.group("host");

            if (matcher.group("port") != null) {
                port = Integer.parseInt(matcher.group("port"));
            } else {
                port = (scheme.equalsIgnoreCase(DEFAULT_SCHEME)) ? DEFAULT_PORT : HTTPS_PORT;
            }

            path = matcher.group("path");
            if (!path.startsWith("/")) {
                path = "/" + path;
            }

            // we do not support query parameters

            if (LOG.isDebugEnabled()) {
                LOG.debug("Proxying to " + getFullProxyUrl() + " as user: " + userName);
            }
        } else {
            invalid = true;
        }
    }

    @Override
    public String toString() {
        return "ProxyDetails{" +
                userName + "@" + getFullProxyUrl()
                + "}";
    }

    @Override
    public String getFullProxyUrl() {
        if (invalid) {
            return null;
        } else {
            return scheme + "://" + getHostAndPort() + path + (Strings.isBlank(queryString) ? "" : "?" + queryString);
        }
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

    @Override
    public String getUserName() {
        return userName;
    }

    @Override
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
