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

import javax.servlet.http.HttpServletRequest;

import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Proxies /service/name/* to the service host/port for 'name' using the Kubernetes service lookup and then
 * passes the rest of the URI to the underlying service.
 */
public class ServiceServlet extends ProxyServlet {
    private static final transient Logger LOG = LoggerFactory.getLogger(ServiceServlet.class);

    @Override
    protected ProxyAddress parseProxyAddress(HttpServletRequest servletRequest) {
        String reqQueryString = servletRequest.getQueryString();
        String queryPostfix = "";
        if (Strings.isNotBlank(reqQueryString)) {
            queryPostfix = "?" + reqQueryString;
        }
        String userName = null;
        String password = null;
        String serviceName = servletRequest.getPathInfo();
        if (serviceName == null) {
            serviceName = "";
        }
        if (serviceName.startsWith("/")) {
            serviceName = serviceName.substring(1);
        }
        int idx = serviceName.indexOf('/');
        String servicePath = "/";
        if (idx > 0) {
            servicePath = serviceName.substring(idx);
            serviceName = serviceName.substring(0, idx);
        }
        if (serviceName.length() == 0) {
            // lets list the services for /service
            serviceName = "kubernetes";
            servicePath = "/kubernetes/api/v1beta2/services";
        }

        String url = ServiceResolver.getSingleton().getServiceURL(serviceName);
        if (url == null) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("No service for: " + serviceName + " path: " + servicePath);
            }
            return null;
        } else {
            url += servicePath + queryPostfix;
            if (LOG.isDebugEnabled()) {
                LOG.debug("Invoking: " + url + " from service: " + serviceName + " path: " + servicePath);
            }
            return new DefaultProxyAddress(url, userName, password);
        }
    }
}
