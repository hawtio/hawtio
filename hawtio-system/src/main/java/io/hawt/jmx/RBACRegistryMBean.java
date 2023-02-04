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

import java.util.Map;

/**
 * <p>MBean that optimizes access to Karaf's RBAC services.</p>
 * <p>When doing client-side initialization, hawtio invokes two time-consuming operations:<ul>
 *     <li>LIST of available MBeans (with metadata consisting in attrs, ops, description</li>
 *     <li>EXEC for <code>org.apache.karaf.management.JMXSecurityMBean#canInvoke(java.util.Map)</code></li>
 * </ul>
 * This becomes unacceptable when we have hundreds of similar MBeans (like ActiveMQ queues or Camel
 * components/endpoints/processors/routes/consumers/...</p>
 * <p>The role of this MBean is to combine LIST+EXEC/RBAC operations into one - and return
 * map that is complete, but optimized (uses shared JSON elements that can be processed by hawtio client
 * app itself).</p>
 */
public interface RBACRegistryMBean {

    /**
     * Returns {@link Map} (that can be nicely handled by Jolokia) containing everything that is initially
     * needed by hawtio client application. It's an optimized and dedicated method that runs much faster than
     * sequence of relevant Jolokia operations (LIST+EXEC with maxDepth=7).
     * @return
     */
    Map<String, Object> list() throws Exception;

}
