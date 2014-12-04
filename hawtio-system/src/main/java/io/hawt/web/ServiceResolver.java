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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;
import java.lang.management.ManagementFactory;
import java.util.Arrays;

/**
 * Resolves the service / container names to a URL to invoke HTTP / HTTPS requests
 */
public class ServiceResolver {
    private static final transient Logger LOG = LoggerFactory.getLogger(ServiceResolver.class);

    public static ServiceResolver singleton = new ServiceResolver();
    public static ObjectName OBJECT_NAME;

    static {
        try {
            OBJECT_NAME = new ObjectName("io.fabric8:type=KubernetesManager");
        } catch (MalformedObjectNameException e) {
            // ignore
        }
    }
    public static ServiceResolver getSingleton() {
        return singleton;
    }

    public String getServiceURL(String serviceName) {
        ObjectName objectName = OBJECT_NAME;
        String operationName = "getServiceUrl";
        Object[] params = { serviceName };
        String[] types = { String.class.getName() };
        Object answer = invokeMBeanOperation(objectName, operationName, params, types);
        return answer != null ? answer.toString() : null;
    }

    public String getPodUrl(String podName, String port) {
        ObjectName objectName = OBJECT_NAME;
        String operationName = "getPodUrl";
        Object[] params = { podName, port };
        String[] types = { String.class.getName(), String.class.getName() };
        Object answer = invokeMBeanOperation(objectName, operationName, params, types);
        return answer != null ? answer.toString() : null;
    }

    protected static Object invokeMBeanOperation(ObjectName objectName, String operationName, Object[] params, String[] types) {
        MBeanServer mBeanServer = ManagementFactory.getPlatformMBeanServer();
        Object answer = null;
        if (mBeanServer != null && mBeanServer.isRegistered(objectName)) {
            try {
                answer = mBeanServer.invoke(objectName, operationName, params, types);
            } catch (Exception e) {
                LOG.warn("Could not invoke: " + operationName + Arrays.asList(params) + " on " + objectName + ". " + e, e);
            }
        }
        return answer;
    }
}
