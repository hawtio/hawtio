/*
 *  Copyright 2017 Red Hat, Inc.
 *
 *  Red Hat licenses this file to you under the Apache License, version
 *  2.0 (the "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *  implied.  See the License for the specific language governing
 *  permissions and limitations under the License.
 */
package io.hawt.system;

import java.lang.management.ManagementFactory;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import javax.annotation.Nonnull;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanInfo;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.security.auth.Subject;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Cached MBean server invoker for {@link RBACRestrictor}.
 */
public class RBACMBeanInvoker {

    private static final Logger LOG = LoggerFactory.getLogger(RBACMBeanInvoker.class);

    /**
     * The length of time (in minutes) an entry in canInvokeCache is valid after creation
     */
    private static final long CAN_INVOKE_CACHE_DURATION = 10;

    /**
     * The length of time (in minutes) an entry in mbeanInfoCache is valid after creation
     */
    private static final long MBEAN_INFO_CACHE_DURATION = 10;

    protected MBeanServer mBeanServer;
    protected ObjectName securityMBean;

    protected LoadingCache<CanInvokeKey, Boolean> canInvokeCache;
    protected LoadingCache<ObjectName, Map<String, MBeanAttributeInfo>> mbeanInfoCache;

    protected static class CanInvokeKey {
        protected String username;
        protected ObjectName objectName;
        protected String operation;

        protected CanInvokeKey(String username, ObjectName objectName, String operation) {
            this.username = username;
            this.objectName = objectName;
            this.operation = operation;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == this) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (!(obj instanceof CanInvokeKey)) {
                return false;
            }
            CanInvokeKey key = (CanInvokeKey) obj;
            return Objects.equals(username, key.username)
                && Objects.equals(objectName, key.objectName)
                && Objects.equals(operation, key.operation);
        }

        @Override
        public int hashCode() {
            return Objects.hash(username, objectName, operation);
        }

        @Override
        public String toString() {
            return String.format("%s{username=%s, objectName=%s, operation=%s}",
                getClass().getSimpleName(), username, objectName, operation);
        }
    }

    public RBACMBeanInvoker() {
        initSecurityMBean();
        initCaches();
    }

    protected void initSecurityMBean() {
        this.mBeanServer = ManagementFactory.getPlatformMBeanServer();
        Set<ObjectName> mbeans = new HashSet<>();
        try {
            mbeans = mBeanServer.queryNames(new ObjectName("*:type=security,area=jmx,*"), null);
            if (LOG.isDebugEnabled()) {
                LOG.debug("Found JMXSecurity MBeans: {}", mbeans);
            }
        } catch (MalformedObjectNameException e) {
            LOG.error(e.getMessage(), e);
        }
        if (mbeans.isEmpty()) {
            LOG.info("Didn't discover any JMXSecurity MBeans, role based access control is disabled");
            this.securityMBean = null;
            return;
        }

        ObjectName chosen = JmxHelpers.chooseMBean(mbeans);
        LOG.info("Using MBean [{}] for role based access control", chosen);
        this.securityMBean = chosen;
    }

    protected void initCaches() {
        this.canInvokeCache = CacheBuilder.newBuilder()
            .expireAfterWrite(CAN_INVOKE_CACHE_DURATION, TimeUnit.MINUTES)
            .build(new CacheLoader<CanInvokeKey, Boolean>() {
                @Override
                public Boolean load(@Nonnull CanInvokeKey key) throws Exception {
                    LOG.debug("Do invoking canInvoke() for {}", key);
                    return doCanInvoke(key.objectName, key.operation);
                }
            });
        this.mbeanInfoCache = CacheBuilder.newBuilder()
            .expireAfterWrite(MBEAN_INFO_CACHE_DURATION, TimeUnit.MINUTES)
            .build(new CacheLoader<ObjectName, Map<String, MBeanAttributeInfo>>() {
                @Override
                public Map<String, MBeanAttributeInfo> load(@Nonnull ObjectName objectName) throws Exception {
                    LOG.debug("Do loading MBean attributes for {}", objectName);
                    return loadMBeanAttributes(objectName);
                }
            });
    }

    protected boolean doCanInvoke(ObjectName objectName, String operation) throws Exception {
        List<String> argTypes = new ArrayList<>();
        String opName = parseOperation(operation, argTypes);
        // The order of properties in an object name is critical for Karaf, so we cannot use
        // ObjectName.getCanonicalName() to get the object name string here
        // See: https://issues.apache.org/jira/browse/KARAF-4600
        Object[] params = new Object[] { objectName.toString(), opName, argTypes.toArray(new String[0]) };
        String[] signature = new String[] { String.class.getName(), String.class.getName(), String[].class.getName() };
        return (boolean) mBeanServer.invoke(securityMBean, "canInvoke", params, signature);
    }

    private String parseOperation(String operation, List<String> argTypes) {
        operation = operation.trim();
        int index = operation.indexOf('(');
        if (index < 0) {
            return operation;
        }

        String args = operation.substring(index + 1, operation.length() - 1);
        for (String arg : args.split(",")) {
            if (!"".equals(arg)) {
                argTypes.add(arg);
            }
        }

        return operation.substring(0, index);
    }

    private static void logMBeanError(Exception e) {
        if (e instanceof InstanceNotFoundException) {
            LOG.info("Instance not found: {}", e.getMessage());
        } else if (e.getCause() instanceof InstanceNotFoundException) {
            LOG.info("Instance not found: {}", e.getCause().getMessage());
        } else {
            LOG.error("Error while invoking JMXSecurity MBean: " + e.getMessage(), e);
        }
    }

    protected Map<String, MBeanAttributeInfo> loadMBeanAttributes(ObjectName objectName) throws Exception {
        MBeanInfo mBeanInfo = mBeanServer.getMBeanInfo(objectName);
        Map<String, MBeanAttributeInfo> answer = new HashMap<>();
        for (MBeanAttributeInfo info : mBeanInfo.getAttributes()) {
            answer.put(info.getName(), info);
        }
        return answer;
    }

    public boolean canInvoke(ObjectName objectName, String operation) {
        if (this.securityMBean == null) {
            // JMXSecurity MBean is not found, thus RBAC is disabled
            return true;
        }

        AccessControlContext acc = AccessController.getContext();
        Subject subject = Subject.getSubject(acc);
        try {
            if (subject != null) {
                String username = AuthHelpers.getUsername(subject);
                return canInvokeCache.get(new CanInvokeKey(username, objectName, operation));
            } else {
                // For now, let's bypass the caching and directly invoke the security MBean if
                // subject is not available (which could happen on some platforms other than Karaf)
                LOG.debug("Subject not available, directly invoking canInvoke(): {}, {}", objectName, operation);
                return doCanInvoke(objectName, operation);
            }
        } catch (Exception e) {
            logMBeanError(e);
            return false;
        }
    }

    public boolean isReadAllowed(ObjectName objectName, String attribute) {
        if (this.securityMBean == null) {
            // JMXSecurity MBean is not found, thus RBAC is disabled
            return true;
        }

        try {
            MBeanAttributeInfo info = mbeanInfoCache.get(objectName).get(attribute);
            if (info == null) {
                LOG.error("Attribute '{}' not found for MBean '{}'", attribute, objectName);
                return false;
            }
            return canInvoke(objectName, getAccessor(info, false));
        } catch (Exception e) {
            logMBeanError(e);
            return false;
        }
    }

    public boolean isWriteAllowed(ObjectName objectName, String attribute) {
        if (this.securityMBean == null) {
            // JMXSecurity MBean is not found, thus RBAC is disabled
            return true;
        }

        try {
            MBeanAttributeInfo info = mbeanInfoCache.get(objectName).get(attribute);
            if (info == null) {
                LOG.error("Attribute '{}' not found for MBean '{}'", attribute, objectName);
                return false;
            }
            return canInvoke(objectName, getAccessor(info, true));
        } catch (Exception e) {
            logMBeanError(e);
            return false;
        }
    }

    private String getAccessor(MBeanAttributeInfo attribute, boolean write) {
        if (write) {
            return String.format("set%s(%s)", attribute.getName(), attribute.getType());
        } else {
            return String.format("%s%s()", attribute.isIs() ? "is" : "get", attribute.getName());
        }
    }

}
