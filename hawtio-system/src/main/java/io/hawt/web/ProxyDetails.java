package io.hawt.web;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;

import io.hawt.system.AuthInfo;
import io.hawt.system.Authenticator;
import io.hawt.system.ExtractAuthInfoCallback;
import io.hawt.util.Strings;
import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A helper object to store the proxy location details
 */
public class ProxyDetails implements ProxyAddress {
    private static final transient Logger LOG = LoggerFactory.getLogger(ProxyDetails.class);

    private String stringProxyURL;
    private String hostAndPort;
    private String scheme = "http";
    private String path = "";
    private String userName;
    private String password;
    private String host;
    private int port = 80;

    public static final String USER_PARAM = "_user";
    public static final String PWD_PARAM = "_pwd";

    private static Set<String> ignoreHeaderNames = new HashSet<String>(Arrays.asList(USER_PARAM, PWD_PARAM, "_url", "url"));

    public ProxyDetails(HttpServletRequest httpServletRequest) {
        this(httpServletRequest.getPathInfo());

        String authHeader = httpServletRequest.getHeader(Authenticator.HEADER_AUTHORIZATION);

        if (authHeader != null && !authHeader.equals("")) {

            final AuthInfo info = new AuthInfo();

            Authenticator.extractAuthInfo(authHeader, new ExtractAuthInfoCallback() {
                @Override
                public void getAuthInfo(String userName, String password) {
                    info.username = userName;
                    info.password = password;
                }
            });

            userName = info.username;
            password = info.password;
        }

        // lets add the query parameters
        Enumeration<?> iter = httpServletRequest.getParameterNames();
        while (iter != null && iter.hasMoreElements()) {
            Object next = iter.nextElement();
            if (next instanceof String) {
                String name = next.toString();
                if (!ignoreHeaderNames.contains(name)) {
                    String[] values = httpServletRequest.getParameterValues(name);
                    for (String value : values) {
                        String prefix = "?";
                        if (stringProxyURL.contains("?")) {
                            prefix = "&";
                        }
                        stringProxyURL += prefix + name + "=" + value;
                    }
                }
            }
        }
    }

    public ProxyDetails(String pathInfo) {
        hostAndPort = pathInfo;

        if (hostAndPort == null) {
            return;
        }

        while (hostAndPort.startsWith("/")) {
            hostAndPort = hostAndPort.substring(1);
        }

        if (hostAndPort.startsWith("http/")) {
            scheme = "http";
            hostAndPort = hostAndPort.substring(5);
        } else if (hostAndPort.startsWith("https/")) {
            scheme = "https";
            hostAndPort = hostAndPort.substring(6);
        }

        // remove user/pwd
        int idx = hostAndPort.indexOf("@");
        if (idx > 0) {
            userName = hostAndPort.substring(0, idx);
            hostAndPort = hostAndPort.substring(idx + 1);

            idx = indexOf(userName, ":", "/");
            if (idx > 0) {
                password = userName.substring(idx + 1);
                userName = userName.substring(0, idx);
            }
        }
        host = hostAndPort;
        int schemeIdx = indexOf(hostAndPort, "://");
        if (schemeIdx > 0) {
            scheme = hostAndPort.substring(0, schemeIdx);
            hostAndPort = hostAndPort.substring(schemeIdx + 3);
        } else {
            // hawtio may report scheme without a double slash so lets handle that 'bug' also
            schemeIdx = indexOf(hostAndPort, ":/");
            if (schemeIdx > 0) {
                scheme = hostAndPort.substring(0, schemeIdx);
                hostAndPort = hostAndPort.substring(schemeIdx + 2);
            }
        }
        idx = indexOf(hostAndPort, ":", "/");
        if (idx > 0) {
            host = hostAndPort.substring(0, idx);
            String portText = hostAndPort.substring(idx + 1);
            idx = portText.indexOf("/");
            if (idx >= 0) {
                path = portText.substring(idx);
                portText = portText.substring(0, idx);
            }

            if (Strings.isNotBlank(portText)) {
                // portText may be a port unless its default
                try {
                    port = Integer.parseInt(portText);
                    hostAndPort = host + ":" + port;
                } catch (NumberFormatException e) {
                    port = "http".equals(scheme) ? 80 : 443;
                    // we do not have a port, so path is the portText
                    path = "/" + portText + path;
                    hostAndPort = host;
                }
            } else {
                hostAndPort = host;
            }
        }

        stringProxyURL = scheme + "://" + hostAndPort + path;

        // we do not support query parameters

        if (LOG.isDebugEnabled()) {
            LOG.debug("Proxying to " + stringProxyURL + " as user: " + userName);
        }
    }

    @Override
    public String getFullProxyUrl() {
        return stringProxyURL;
    }

    @Override
    public String toString() {
        return "ProxyDetails{" +
                userName + "@" + hostAndPort + "/" + stringProxyURL
                + "}";
    }

    /**
     * Returns the lowest index of the given list of values
     */
    protected int indexOf(String text, String... values) {
        int answer = -1;
        for (String value : values) {
            int idx = text.indexOf(value);
            if (idx >= 0) {
                if (answer < 0 || idx < answer) {
                    answer = idx;
                }
            }
        }
        return answer;
    }

    public HttpClient createHttpClient(HttpMethod httpMethodProxyRequest) {
        HttpClient client = new HttpClient();

        if (userName != null) {
            //client.getParams().setAuthenticationPreemptive(true);
            httpMethodProxyRequest.setDoAuthentication(true);

            Credentials defaultcreds = new UsernamePasswordCredentials(userName, password);
            client.getState().setCredentials(new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);
        }
        return client;
    }

    public String getStringProxyURL() {
        return stringProxyURL;
    }

    public String getProxyHostAndPort() {
        return hostAndPort;
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

    public int getPort() {
        return port;
    }

    public String getUserName() {
        return userName;
    }

    public String getPassword() {
        return password;
    }

    public String getHostAndPort() {
        return hostAndPort;
    }

    public String getPath() {
        return path;
    }

    public boolean isValid() {
        return hostAndPort != null;
    }
}
