/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.osgi.jmx;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.openmbean.CompositeData;
import javax.management.openmbean.TabularData;

import org.apache.karaf.management.JMXSecurityMBean;
import org.junit.Test;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.anyMap;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class RBACDecoratorTest {

    private static Logger LOG = LoggerFactory.getLogger(RBACDecoratorTest.class);

    @Test
    public void objectNameSplitting() throws MalformedObjectNameException {
        assertThat(RBACDecorator.nameSegments(new ObjectName("a.b:type=a,name=b")).toArray(new String[3]),
                equalTo(new String[] { "a.b", "a", "b" }));
        assertThat(RBACDecorator.nameSegments(new ObjectName("a.b:name=b,type=a")).toArray(new String[3]),
                equalTo(new String[] { "a.b", "a", "b" }));
    }

    @Test
    public void iteratingDownPids() {
        assertThat(RBACDecorator.iterateDownPids(Arrays.asList("a.b", "c", "d")).toArray(new String[4]),
                equalTo(new String[] { "jmx.acl.a.b.c.d", "jmx.acl.a.b.c", "jmx.acl.a.b", "jmx.acl" }));
    }

    /**
     * Test that checks if two different {@link ObjectName}s have RBAC information defined in same PID(s) they
     * can share RBAC information returned to hawtio.
     */
    @Test
    public void effectivePids() throws MalformedObjectNameException {
        // two MBean may share JSONified MBeanInfo if they have similar ObjectName (in AMQ) or if they share
        // javax.management.MBeanInfo.getClassName() (in Camel)
        // but wrt RBAC, they need to share a list of PIDs that may define RBAC information

        // Queue with org.apache.activemq:type=Broker,brokerName=amq,destinationType=Queue,destinationName=ENTESB-4055-0001
        // ObjectName is checked against these PIDs:
        //  - jmx.acl.org.apache.activemq.Broker.amq.Queue.ENTESB-4055-0001,
        //  - jmx.acl.org.apache.activemq.Broker.amq.Queue,
        //  - jmx.acl.org.apache.activemq.Broker.amq,
        //  - jmx.acl.org.apache.activemq.Broker,
        //  - jmx.acl.org.apache.activemq,
        //  - jmx.acl
        // any of the above may actually be configured under generic PID, like "jmx.acl.org.apache.activemq.Broker._.Queue",
        // meaning any Queue in brokers with any name
        // we can share RBAC info for two object names ONLY if all the PIDs are equal

        // configadmin may return different jmx.acl* PIDs - in any order

        // real order that is examined
        List<String> realJmxAclPids = Arrays.asList(
                "jmx.acl.org.apache.activemq.Broker.amq1.Queue.q2",
                "jmx.acl.org.apache.activemq.Broker.amq1.Queue._",
                "jmx.acl.org.apache.activemq.Broker._.Queue.q1",
                "jmx.acl.org.apache.activemq.Broker._.Queue",
                "jmx.acl.org.apache.activemq.Broker.amq2",
                "jmx.acl.org.apache.activemq.Broker._",
                "jmx.acl.org.apache.activemq._",
                "jmx.acl.org.apache.activemq",
                "jmx.acl");
        // configAdmin.listConfigurations("(service.pid=jmx.acl*)") may return PIDs in any order
        Collections.shuffle(realJmxAclPids);

        // ActiveMQ queues from broker amq1
        ObjectName o11 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq1,destinationType=Queue,destinationName=q1");
        ObjectName o12 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq1,destinationType=Queue,destinationName=q2");
        ObjectName o13 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq1,destinationType=Queue,destinationName=q3");
        // ActiveMQ queues from broker amq2
        ObjectName o21 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq2,destinationType=Queue,destinationName=q1");
        ObjectName o22 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq2,destinationType=Queue,destinationName=q2");
        // ActiveMQ queues from broker amq3
        ObjectName o31 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq3,destinationType=Queue,destinationName=q1");
        // ActiveMQ queues from broker amq4
        ObjectName o41 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq4,destinationType=Queue,destinationName=q1");

        // jmx.acl.org.apache.activemq.Broker.amq1.Queue._.cfg != jmx.acl.org.apache.activemq.Broker.amq1.Queue.q2.cfg
        assertFalse(RBACDecorator.mayShareRBACInfo(realJmxAclPids, o11, o12));
        assertTrue(RBACDecorator.mayShareRBACInfo(realJmxAclPids, o11, o13));
        // jmx.acl.org.apache.activemq.Broker.amq1.Queue.q2.cfg != jmx.acl.org.apache.activemq.Broker.amq1.Queue._.cfg
        assertFalse(RBACDecorator.mayShareRBACInfo(realJmxAclPids, o12, o13));

        // jmx.acl.org.apache.activemq.Broker.amq1.Queue._.cfg != jmx.acl.org.apache.activemq.Broker._.Queue.q1.cfg
        assertFalse(RBACDecorator.mayShareRBACInfo(realJmxAclPids, o11, o21));

        // jmx.acl.org.apache.activemq.Broker._.Queue.q1.cfg == jmx.acl.org.apache.activemq.Broker._.Queue.q1.cfg, but
        // jmx.acl.org.apache.activemq.Broker.amq2.cfg != jmx.acl.org.apache.activemq.Broker._.cfg
        assertFalse(RBACDecorator.mayShareRBACInfo(realJmxAclPids, o21, o31));

        assertTrue(RBACDecorator.mayShareRBACInfo(realJmxAclPids, o31, o41));
    }

    @Test
    public void objectNameKeys() throws MalformedObjectNameException, UnsupportedEncodingException, NoSuchAlgorithmException {
        // real order that is examined
        List<String> realJmxAclPids = Arrays.asList(
                "jmx.acl.org.apache.activemq.Broker.amq1.Queue.q2",
                "jmx.acl.org.apache.activemq.Broker.amq1.Queue._",
                "jmx.acl.org.apache.activemq.Broker._.Queue.q1",
                "jmx.acl.org.apache.activemq.Broker._.Queue",
                "jmx.acl.org.apache.activemq.Broker.amq2",
                "jmx.acl.org.apache.activemq.Broker._",
                "jmx.acl.org.apache.activemq._",
                "jmx.acl.org.apache.activemq",
                "jmx.acl");

        // ActiveMQ queues from broker amq1
        ObjectName o11 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq1,destinationType=Queue,destinationName=q1");
        ObjectName o12 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq1,destinationType=Queue,destinationName=q2");
        ObjectName o13 = new ObjectName("org.apache.activemq:type=Broker,brokerName=amq1,destinationType=Queue,destinationName=q3");

        String k1 = RBACDecorator.pidListKey(realJmxAclPids, o11);
        String k2 = RBACDecorator.pidListKey(realJmxAclPids, o12);
        String k3 = RBACDecorator.pidListKey(realJmxAclPids, o13);
        assertThat(k1, not(equalTo(k2)));
        assertThat(k1, equalTo(k3));
    }

    @Test
    @SuppressWarnings("unchecked")
    public void decorateCanInvoke() throws Exception {
        BundleContext bc = setUpMocksForDecorate();
        RBACDecorator decorator = new RBACDecorator(bc);

        String inputJson = getClass().getSimpleName() + "-input.json";
        Map<String, Object> result = new ObjectMapper().readValue(
                getClass().getResourceAsStream(inputJson), Map.class);

        LOG.info("In:  {}", result);
        decorator.decorate(result);
        LOG.info("Out: {}", result);

        Map<String, Map<String, Object>> domains = (Map<String, Map<String, Object>>) result.get("domains");
        Map<String, Object> domain = domains.get("org.apache.activemq");
        Map<String, Object> mbean = (Map<String, Object>) domain.get("type=Broker,brokerName=amq");
        assertThat(mbean.get("canInvoke"), equalTo((Object) false));

        // op
        Map<String, Object> op = (Map<String, Object>) mbean.get("op");
        LOG.info("op = {}", op);
        assertThat(((Map<String, Object>) op.get("removeQueue")).get("canInvoke"), equalTo((Object) false));
        assertThat(((Map<String, Object>) op.get("addQueue")).get("canInvoke"), equalTo((Object) false));
        assertThat(((Map<String, Object>) op.get("stop")).get("canInvoke"), equalTo((Object) true));
        assertThat(((Map<String, Object>) op.get("start")).get("canInvoke"), equalTo((Object) true));
        assertThat(((List<Map<String, Object>>) op.get("overloadedMethod")).get(0).get("canInvoke"), equalTo((Object) true));
        assertThat(((List<Map<String, Object>>) op.get("overloadedMethod")).get(1).get("canInvoke"), equalTo((Object) false));
        assertThat(((List<Map<String, Object>>) op.get("overloadedMethod")).get(2).get("canInvoke"), equalTo((Object) true));

        // opByString
        Map<String, Map<String, Boolean>> opByString = (Map<String, Map<String, Boolean>>) mbean.get("opByString");
        assertThat(opByString, notNullValue());
        LOG.info("opByString = {}", opByString);
        assertThat(opByString.keySet(), containsInAnyOrder(
                "removeQueue(java.lang.String)",
                "addQueue(java.lang.String)",
                "stop()",
                "start()",
                "overloadedMethod(java.lang.String)",
                "overloadedMethod(java.lang.String,java.lang.Object)",
                "overloadedMethod()"));
        assertThat(opByString.get("removeQueue(java.lang.String)").get("canInvoke"), equalTo(false));
        assertThat(opByString.get("addQueue(java.lang.String)").get("canInvoke"), equalTo(false));
        assertThat(opByString.get("stop()").get("canInvoke"), equalTo(true));
        assertThat(opByString.get("start()").get("canInvoke"), equalTo(true));
        assertThat(opByString.get("overloadedMethod(java.lang.String)").get("canInvoke"), equalTo(true));
        assertThat(opByString.get("overloadedMethod(java.lang.String,java.lang.Object)").get("canInvoke"), equalTo(false));
        assertThat(opByString.get("overloadedMethod()").get("canInvoke"), equalTo(true));
    }

    @SuppressWarnings("unchecked")
    private BundleContext setUpMocksForDecorate() throws Exception {
        BundleContext bc = mock(BundleContext.class);

        // mocks for ConfigurationAdmin
        ServiceReference<ConfigurationAdmin> cmRef = mock(ServiceReference.class);
        when(bc.getServiceReference(ConfigurationAdmin.class)).thenReturn(cmRef);
        ConfigurationAdmin configAdmin = mock(ConfigurationAdmin.class);
        when(bc.getService(cmRef)).thenReturn(configAdmin);
        Configuration config = mock(Configuration.class);
        when(configAdmin.listConfigurations(anyString())).thenReturn(new Configuration[] { config });
        when(config.getPid()).thenReturn("pid-xxxxx");

        // mocks for JMXSecurityMBean
        ServiceReference<JMXSecurityMBean> jmxSecRef = mock(ServiceReference.class);
        when(bc.getServiceReference(JMXSecurityMBean.class)).thenReturn(jmxSecRef);
        JMXSecurityMBean jmxSec = mock(JMXSecurityMBean.class);
        when(bc.getService(jmxSecRef)).thenReturn(jmxSec);
        TabularData td = mock(TabularData.class);
        when(jmxSec.canInvoke(anyMap())).thenReturn(td);

        CompositeData cdForMBeans = mock(CompositeData.class);
        CompositeData cdForMBeanOps = mock(CompositeData.class);
        when((Collection<CompositeData>) td.values()).thenReturn(
                Arrays.asList(cdForMBeans),
                Arrays.asList(
                        cdForMBeanOps, cdForMBeanOps, cdForMBeanOps, cdForMBeanOps,
                        cdForMBeanOps, cdForMBeanOps, cdForMBeanOps));
        when(cdForMBeans.get("ObjectName")).thenReturn("org.apache.activemq:type=Broker,brokerName=amq");
        when(cdForMBeans.get("CanInvoke")).thenReturn(false);
        when(cdForMBeanOps.get("ObjectName")).thenReturn("org.apache.activemq:type=Broker,brokerName=amq");
        when(cdForMBeanOps.get("Method")).thenReturn(
                "removeQueue(java.lang.String)",
                "addQueue(java.lang.String)",
                "stop()",
                "start()",
                "overloadedMethod(java.lang.String)",
                "overloadedMethod(java.lang.String,java.lang.Object)",
                "overloadedMethod()");
        // invoked two times for each cd
        when(cdForMBeanOps.get("CanInvoke")).thenReturn(
                false, false,
                false, false,
                true, true,
                true, true,
                true, true,
                false, false,
                true, true);

        return bc;
    }
}
