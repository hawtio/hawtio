/*
 *  Copyright 2005-2016 Red Hat, Inc.
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
package io.hawt.jmx;

import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.IntrospectionException;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanException;
import javax.management.MBeanInfo;
import javax.management.MBeanNotificationInfo;
import javax.management.MBeanOperationInfo;
import javax.management.MBeanParameterInfo;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.management.ReflectionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>Generally we do enhanced Jolokia <code>list</code> operation, but if OSGi env is found we decorate the returned
 * objects with RBAC information.</p>
 */
public class RBACRegistry implements RBACRegistryMBean {

    public static Logger LOG = LoggerFactory.getLogger(RBACRegistry.class);

    private ObjectName rbacDecorator = null;

    private ObjectName objectName;
    private MBeanServer mBeanServer;

    public void init() throws Exception {
        if (objectName == null) {
            objectName = new ObjectName("hawtio:type=security,name=RBACRegistry");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        if (mBeanServer != null) {
            rbacDecorator = new ObjectName("hawtio:type=security,area=jolokia,name=RBACDecorator");
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }
        }
    }

    public void destroy() throws Exception {
        if (objectName != null && mBeanServer != null) {
            mBeanServer.unregisterMBean(objectName);
        }
    }

    @Override
    public Map<String, Object> list() throws Exception {
        Map<String, Object> result = new HashMap<>();

        // domain -> [mbean, mbean, ...], where mbean is either inline jsonified MBeanInfo or a key to shared
        // jsonified MBeanInfo
        Map<String, Map<String, Object>> domains = new HashMap<>();
        // if MBean is found to be "special", we can cache JSONified MBeanInfo (an object with "op", "attr" and "desc"
        // properties)
        // key -> [mbeaninfo, mbeaninfo, ...]
        Map<String, Map<String, Object>> cache = new HashMap<>();

        result.put("cache", cache);
        result.put("domains", domains);

        if (mBeanServer == null) {
            return result;
        }

        Set<ObjectName> visited = new HashSet<>();

        // see: org.jolokia.backend.executor.AbstractMBeanServerExecutor.each()
        for (ObjectName nameObject : mBeanServer.queryNames(null, null)) {
            addMBeanInfo(cache, domains, visited, nameObject);
        }

        tryAddRBACInfo(result);

        return result;
    }

    private void addMBeanInfo(Map<String, Map<String, Object>> cache, Map<String, Map<String, Object>> domains, Set<ObjectName> visited,
                              ObjectName nameObject) throws IntrospectionException, ReflectionException {
        // Don't add if already visited previously
        if (visited.contains(nameObject)) {
            return;
        }

        Map<String, Object> jsonifiedMBeanInfo;

        // Let's try to avoid invoking getMBeanInfo. simply domain+type attr is not enough, but we may
        // detect special cases
        String mbeanInfoKey = isSpecialMBean(nameObject);
        if (mbeanInfoKey != null && cache.containsKey(mbeanInfoKey)) {
            jsonifiedMBeanInfo = cache.get(mbeanInfoKey);
        } else {
            // we may have to assemble the info on the fly
            try {
                MBeanInfo mBeanInfo = mBeanServer.getMBeanInfo(nameObject);

                // 2nd level of special cases - a bit slower (we had to getMBeanInfo(), but we may try
                // cache by MBean's domain and class)
                if (mbeanInfoKey == null) {
                    mbeanInfoKey = isSpecialClass(nameObject, mBeanInfo);
                }
                if (mbeanInfoKey != null && cache.containsKey(mbeanInfoKey)) {
                    jsonifiedMBeanInfo = cache.get(mbeanInfoKey);
                } else {
                    // hard work here
                    jsonifiedMBeanInfo = jsonifyMBeanInfo(mBeanInfo);
                }

                if (mbeanInfoKey != null) {
                    cache.put(mbeanInfoKey, jsonifiedMBeanInfo);
                }
            } catch (InstanceNotFoundException e) {
                // Log failure and continue so that we can still send a response back
                LOG.debug("Failed to get MBean info for {}. Due to InstanceNotFoundException.", nameObject);
                return;
            }
        }

        Map<String, Object> domain = domains.computeIfAbsent(nameObject.getDomain(), key -> new HashMap<>());

        // jsonifiedMBeanInfo should not be null here and *may* be cached
        if (mbeanInfoKey != null) {
            // in hawtio we'll check `typeof info === 'string'` (angular.isString(info))
            domain.put(nameObject.getKeyPropertyListString(), mbeanInfoKey);
        } else {
            // angular.isObject(info)
            domain.put(nameObject.getKeyPropertyListString(), jsonifiedMBeanInfo);
        }

        visited.add(nameObject);
    }

    /**
     * This method duplicates what Jolokia does in List Handler in order to convert {@link MBeanInfo} to JSON.
     */
    private Map<String, Object> jsonifyMBeanInfo(MBeanInfo mBeanInfo) {
        Map<String, Object> result = new LinkedHashMap<>();

        // desc
        result.put("desc", mBeanInfo.getDescription());

        // attr
        Map<String, Object> attrMap = new LinkedHashMap<>();
        result.put("attr", attrMap);
        for (MBeanAttributeInfo attrInfo : mBeanInfo.getAttributes()) {
            if (attrInfo == null) {
                continue;
            }
            Map<String, Object> attr = new HashMap<>();
            attr.put("type", attrInfo.getType());
            attr.put("desc", attrInfo.getDescription());
            attr.put("rw", attrInfo.isWritable() && attrInfo.isReadable());
            attrMap.put(attrInfo.getName(), attr);
        }

        // op
        Map<String, Object> opMap = new LinkedHashMap<>();
        result.put("op", opMap);
        for (MBeanOperationInfo opInfo : mBeanInfo.getOperations()) {
            Map<String, Object> map = new HashMap<>();
            List<Map<String, String>> argList = new ArrayList<>(opInfo.getSignature().length);
            for (MBeanParameterInfo paramInfo : opInfo.getSignature()) {
                Map<String, String> args = new HashMap<>();
                args.put("desc", paramInfo.getDescription());
                args.put("name", paramInfo.getName());
                args.put("type", paramInfo.getType());
                argList.add(args);
            }
            map.put("args", argList);
            map.put("ret", opInfo.getReturnType());
            map.put("desc", opInfo.getDescription());
            Object ops = opMap.get(opInfo.getName());
            if (ops != null) {
                if (ops instanceof List) {
                    // If it is already a list, simply add it to the end
                    ((List) ops).add(map);
                } else if (ops instanceof Map) {
                    // If it is a map, add a list with two elements
                    // (the old one and the new one)
                    List<Object> opList = new LinkedList<>();
                    opList.add(ops);
                    opList.add(map);
                    opMap.put(opInfo.getName(), opList);
                }
            } else {
                // No value set yet, simply add the map as plain value
                opMap.put(opInfo.getName(), map);
            }
        }

        // not
        Map<String, Object> notMap = new LinkedHashMap<>();
        result.put("not", notMap);
        for (MBeanNotificationInfo notInfo : mBeanInfo.getNotifications()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", notInfo.getName());
            map.put("desc", notInfo.getDescription());
            String[] types = notInfo.getNotifTypes();
            List<String> tList = new ArrayList<>(types.length);
            Collections.addAll(tList, types);
            map.put("types", tList);
            notMap.put(notInfo.getName(), map);
        }

        // this is default - in case we won't find RBACDecorator (possible in hawtio-wildfly for example)
        result.put("canInvoke", true);

        return result;
    }

    /**
     * If the {@link ObjectName} is detected as <em>special</em> (when we may have thousands of such MBeans), we
     * return a key to lookup already processed {@link MBeanInfo}
     */
    private String isSpecialMBean(ObjectName nameObject) {
        String domain = nameObject.getDomain();
        switch (domain) {
        case "org.apache.activemq":
            final String destinationType = nameObject.getKeyProperty("destinationType");
            // see: org.apache.activemq.command.ActiveMQDestination.getDestinationTypeAsString()
            if ("Queue".equals(destinationType)) {
                return "activemq:queue";
            }
            if ("TempQueue".equals(destinationType)) {
                return "activemq:tempqueue";
            }
            if ("Topic".equals(destinationType)) {
                return "activemq:topic";
            }
            if ("TempTopic".equals(destinationType)) {
                return "activemq:temptopic";
            }
            break;
        case "org.apache.activemq.artemis":
            final String component = nameObject.getKeyProperty("component");
            if ("addresses".equals(component)) {
                final String subComponent = nameObject.getKeyProperty("subcomponent");
                if (subComponent == null) {
                    return "activemq.artemis:address";
                }
                if ("queues".equals(subComponent)) {
                    return "activemq.artemis:queue";
                }
            }
            break;
        case "org.apache.camel":
            //final String type = nameObject.getKeyProperty("type");
            // TODO: verify: "type" attribute is not enough - we have to know real class of MBean
            return null;
        }

        return null;
    }

    /**
     * If some combination of {@link ObjectName} and MBean's class name is detected as <em>special</em>, we may
     * cache the JSONified {@link MBeanInfo} as well
     */
    private String isSpecialClass(ObjectName nameObject, MBeanInfo mBeanInfo) {
        String domain = nameObject.getDomain();
        if ("org.apache.camel".equals(domain) && mBeanInfo.getClassName() != null) {
            // some real data in env with 12 Camel contexts deployed
            //  - components (total: 102)
            //  - consumers (total: 511)
            //  - context (total: 12)
            //  - endpoints (total: 818)
            //  - errorhandlers (total: 12)
            //  - eventnotifiers (total: 24)
            //  - processors (total: 3600)
            //  - producers (total: 1764)
            //  - routes (total: 511)
            //  - services (total: 548)
            //  - threadpools (total: 66)
            //  - tracer (total: 24)
            return "camel::" + mBeanInfo.getClassName();
        }

        return null;
    }

    /**
     * If we have access to <code>hawtio:type=security,area=jolokia,name=RBACDecorator</code>,
     * we can add RBAC information
     */
    private void tryAddRBACInfo(Map<String, Object> result) throws MBeanException, InstanceNotFoundException, ReflectionException {
        if (mBeanServer != null && mBeanServer.isRegistered(rbacDecorator)) {
            mBeanServer.invoke(rbacDecorator, "decorate", new Object[] { result }, new String[] { Map.class.getName() });
        }
    }

}
