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

import io.hawt.util.Strings;
import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;

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
    private  String host;
    private int port = 80;

    public ProxyDetails(HttpServletRequest httpServletRequest) {
        this(httpServletRequest.getPathInfo());

        // use request params for the user/pwd
        String userParam = httpServletRequest.getParameter("_user");
        if (Strings.isNotBlank(userParam)) {
            userName = userParam;
        }
        String pwdParam = httpServletRequest.getParameter("pwd");
        if (Strings.isNotBlank(pwdParam)) {
            password = pwdParam;
        }
    }

    public ProxyDetails(String pathInfo) {
        System.out.println("pathInfo: " + pathInfo);

        hostAndPort = pathInfo;
        while (hostAndPort.startsWith("/")) {
            hostAndPort = hostAndPort.substring(1);
        }

        // remove user/pwd
        int idx = hostAndPort.indexOf("@");
        if (idx > 0) {
            userName = hostAndPort.substring(0, idx);
            hostAndPort = hostAndPort.substring(idx + 1);

            idx = userName.indexOf(":");
            if (idx > 0) {
                password = userName.substring(idx + 1);
                userName = userName.substring(0, idx);
            }
        }
        stringProxyURL = "http://" + hostAndPort;

        idx = hostAndPort.indexOf("/");
        if (idx > 0) {
            path = hostAndPort.substring(idx);
            hostAndPort = hostAndPort.substring(0, idx);
        }

        host = hostAndPort;
        idx = hostAndPort.indexOf(":");
        if (idx > 0) {
            host = hostAndPort.substring(0, idx);
            String portText = hostAndPort.substring(idx + 1);
            port = Integer.parseInt(portText);
        }

        try {
            // Handle the query string
/*
            if (httpServletRequest.getQueryString() != null) {
                stringProxyURL += "?" + URIUtil.encodeQuery(httpServletRequest.getQueryString());
            }
*/
            System.out.println("Proxying to " + stringProxyURL);
            LOG.debug("Proxying to " + stringProxyURL);
        } catch (Throwable t) {
            throw new RuntimeException(t);
        }
    }

    public HttpClient createHttpClient(HttpMethod httpMethodProxyRequest) {
        HttpClient client = new HttpClient();

        if (userName != null) {
            client.getParams().setAuthenticationPreemptive(true);
            httpMethodProxyRequest.setDoAuthentication(true);

            Credentials defaultcreds = new UsernamePasswordCredentials(userName, password);
            client.getState().setProxyCredentials(new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);
            //client.getState().setCredentials(new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);
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
