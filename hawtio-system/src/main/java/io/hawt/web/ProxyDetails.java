/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web;

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

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;

/**
 * A helper object to store the proxy location details
 */
public class ProxyDetails {
    private static final transient Logger LOG = LoggerFactory.getLogger(ProxyDetails.class);

    private String stringProxyURL;
    private String hostAndPort;
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
        while (iter.hasMoreElements()) {
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
        while (hostAndPort.startsWith("/")) {
            hostAndPort = hostAndPort.substring(1);
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
                port = Integer.parseInt(portText);
                hostAndPort = host + ":" + port;
            } else {
                hostAndPort = host;
            }
        }
        stringProxyURL = "http://" + hostAndPort + path;


        try {
            // Handle the query string
/*
            if (httpServletRequest.getQueryString() != null) {
                stringProxyURL += "?" + URIUtil.encodeQuery(httpServletRequest.getQueryString());
            }
*/
            if (LOG.isDebugEnabled()) {
                LOG.debug("Proxying to " + stringProxyURL + " as user: " + userName);
            }
        } catch (Throwable t) {
            throw new RuntimeException(t);
        }
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
}
