/*
 *  Copyright 2016 Red Hat, Inc.
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
package io.hawt.web;

import io.hawt.system.JmxHelpers;
import org.jolokia.config.ConfigKey;
import org.jolokia.config.Configuration;
import org.jolokia.restrictor.AllowAllRestrictor;
import org.jolokia.restrictor.DenyAllRestrictor;
import org.jolokia.restrictor.Restrictor;
import org.jolokia.restrictor.RestrictorFactory;
import org.jolokia.util.HttpMethod;
import org.jolokia.util.NetworkUtil;
import org.jolokia.util.RequestType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanException;
import javax.management.MBeanInfo;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Jolokia restrictor that protects MBean server invocation inside Jolokia based on RBAC provided by
 * {@link io.hawt.jmx.JMXSecurityMBean}.
 */
public class RBACRestrictor implements Restrictor {

    private static final transient Logger LOG = LoggerFactory.getLogger(RBACRestrictor.class);

    protected Restrictor delegate;
    protected MBeanServer mBeanServer;
    protected ObjectName securityMBean;

    public RBACRestrictor(Configuration config) {
        initDelegate(config);
        initSecurityMBean();
    }

    protected void initDelegate(Configuration config) {
        String location = NetworkUtil.replaceExpression(config.get(ConfigKey.POLICY_LOCATION));
        try {
            this.delegate = RestrictorFactory.lookupPolicyRestrictor(location);
            if (this.delegate != null) {
                LOG.debug("Delegate - Using policy access restrictor {}", location);
            } else {
                LOG.debug("Delegate - No policy access restrictor found, access to any MBean is allowed");
                this.delegate = new AllowAllRestrictor();
            }
        } catch (IOException e) {
            LOG.error("Delegate - Error while accessing access policy restrictor at " + location +
                    ". Denying all access to MBeans for security reasons. Exception: " + e, e);
            this.delegate = new DenyAllRestrictor();
        }
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

    @Override
    public boolean isOperationAllowed(ObjectName objectName, String operation) {
        boolean allowed = delegate.isOperationAllowed(objectName, operation);
        if (allowed) {
            try {
                allowed = canInvoke(objectName, operation);
            } catch (Exception e) {
                LOG.error("Error while invoking JMXSecurity MBean: " + e.getMessage(), e);
                allowed = false;
            }
        }
        if (LOG.isDebugEnabled()) {
            LOG.debug("isOperationAllowed(objectName = {}, operation = {}) = {}",
                    objectName, operation, allowed);
        }
        return allowed;
    }

    private boolean canInvoke(ObjectName objectName, String operation) throws Exception {
        if (this.securityMBean == null) {
            // JMXSecurity MBean is not found, thus RBAC is disabled
            return true;
        }
        List<String> argTypes = new ArrayList<>();
        String opName = parseOperation(operation, argTypes);
        // The order of properties in an object name is critical for Karaf, so we cannot use
        // ObjectName.getCanonicalName() to get the object name string here
        // See: https://issues.apache.org/jira/browse/KARAF-4600
        Object[] params = new Object[] { objectName.toString(), opName, argTypes.toArray(new String[0]) };
        String[] signature = new String[] { String.class.getName(), String.class.getName(), String[].class.getName() };
        try {
            return (boolean) mBeanServer.invoke(securityMBean, "canInvoke", params, signature);
        } catch (InstanceNotFoundException e) {
            LOG.info("Instance not found: {}", e.getMessage());
            return false;
        } catch (MBeanException e) {
            if (e.getCause() instanceof InstanceNotFoundException) {
                LOG.info("Instance not found: {}", e.getCause().getMessage());
                return false;
            }
            throw e;
        }
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

    @Override
    public boolean isAttributeReadAllowed(ObjectName objectName, String attribute) {
        boolean allowed = delegate.isAttributeReadAllowed(objectName, attribute);
        if (allowed) {
            try {
                String accessor = resolveAccessor(objectName, attribute, false);
                allowed = canInvoke(objectName, accessor);
            } catch (Exception e) {
                LOG.error("Error while invoking JMXSecurity MBean: " + e.getMessage(), e);
                allowed = false;
            }
        }
        if (LOG.isDebugEnabled()) {
            LOG.debug("isAttributeReadAllowed(objectName = {}, attribute = {}) = {}",
                    objectName, attribute, allowed);
        }
        return allowed;
    }

    @Override
    public boolean isAttributeWriteAllowed(ObjectName objectName, String attribute) {
        boolean allowed = delegate.isAttributeWriteAllowed(objectName, attribute);
        if (allowed) {
            try {
                String accessor = resolveAccessor(objectName, attribute, true);
                allowed = canInvoke(objectName, accessor);
            } catch (Exception e) {
                LOG.error("Error while invoking JMXSecurity MBean: " + e.getMessage(), e);
                allowed = false;
            }
        }
        if (LOG.isDebugEnabled()) {
            LOG.debug("isAttributeWriteAllowed(objectName = {}, attribute = {}) = {}",
                    objectName, attribute, allowed);
        }
        return allowed;
    }

    private String resolveAccessor(ObjectName objectName, String attribute, boolean write) throws Exception {
        MBeanInfo mBeanInfo = mBeanServer.getMBeanInfo(objectName);
        MBeanAttributeInfo attributeInfo = null;
        for (MBeanAttributeInfo info : mBeanInfo.getAttributes()) {
            if (info.getName().equals(attribute)) {
                attributeInfo = info;
                break;
            }
        }
        if (attributeInfo == null) {
            throw new IllegalArgumentException("Attribute '" + attribute + "' not found for MBean '" + objectName + "'");
        }
        if (write) {
            return String.format("set%s(%s)", attribute, attributeInfo.getType());
        } else {
            return String.format("%s%s()", attributeInfo.isIs() ? "is" : "get", attribute);
        }
    }

    @Override
    public boolean isHttpMethodAllowed(HttpMethod method) {
        boolean allowed = delegate.isHttpMethodAllowed(method);
        if (LOG.isTraceEnabled()) {
            LOG.trace("isHttpMethodAllowed(method = {}) = {}", method, allowed);
        }
        return allowed;
    }

    @Override
    public boolean isTypeAllowed(RequestType type) {
        boolean allowed = delegate.isTypeAllowed(type);
        if (LOG.isTraceEnabled()) {
            LOG.trace("isTypeAllowed(type = {}) = {}", type, allowed);
        }
        return allowed;
    }

    @Override
    public boolean isRemoteAccessAllowed(String... hostOrAddress) {
        boolean allowed = delegate.isRemoteAccessAllowed(hostOrAddress);
        if (LOG.isTraceEnabled()) {
            LOG.trace("isRemoteAccessAllowed(hostOrAddress = {}) = {}",
                    hostOrAddress, allowed);
        }
        return allowed;
    }

    @Override
    public boolean isOriginAllowed(String origin, boolean strictCheck) {
        boolean allowed = delegate.isOriginAllowed(origin, strictCheck);
        if (LOG.isTraceEnabled()) {
            LOG.trace("isOriginAllowed(origin = {}, strictCheck = {}) = {}",
                    origin, strictCheck, allowed);
        }
        return allowed;
    }

}
