/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web;

import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;

/**
 * Proxies /pod/name/port/* to the pod IP/port for 'name' using the Kubernetes service lookup and then
 * passes the rest of the URI to the underlying service.
 */
public class PodServlet extends ProxyServlet {
    private static final transient Logger LOG = LoggerFactory.getLogger(PodServlet.class);

    @Override
    protected ProxyAddress parseProxyAddress(HttpServletRequest servletRequest) {
        String reqQueryString = servletRequest.getQueryString();
        String queryPostfix = "";
        if (Strings.isNotBlank(reqQueryString)) {
            queryPostfix = "?" + reqQueryString;
        }

        String userName = null;
        String password = null;
        String podName = servletRequest.getPathInfo();
        if (podName == null) {
            podName = "";
        }
        if (podName.startsWith("/")) {
            podName = podName.substring(1);
        }
        int idx = podName.indexOf('/');
        String podPort = "";
        String podPath = "/";
        if (idx > 0) {
            podPath = podName.substring(idx);
            podName = podName.substring(0, idx);

            idx = podPath.indexOf('/', 1);
            if (idx >= 0) {
                podPort = podPath.substring(1, idx);
                podPath = podPath.substring(idx);
            }
        }
        if (podName.isEmpty()) {
            // lets list the pods for /pod
            String url = ServiceResolver.getSingleton().getServiceURL("kubernetes");
            if (url == null) {
                return null;
            }
            url += "/kubernetes/api/v1beta2/pods" + queryPostfix;
            return new DefaultProxyAddress(url, userName, password);
        }
        String url = ServiceResolver.getSingleton().getPodUrl(podName, podPort);
        if (url == null) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("No pod for: " + podName + " port: " + podPort + " path: " + podPath);
            }
            System.out.println("No pod for: " + podName + " port: " + podPort + " path: " + podPath);
            return null;
        } else {
            url += podPath + queryPostfix;
            if (LOG.isDebugEnabled()) {
                LOG.debug("Invoking: " + url + " from pod: " + podName + " port: " + podPort + " path: " + podPath);
            }
            System.out.println("Invoking: " + url + " from pod: " + podName + " port: " + podPort + " path: " + podPath);
            return new DefaultProxyAddress(url, userName, password);
        }
    }
}
