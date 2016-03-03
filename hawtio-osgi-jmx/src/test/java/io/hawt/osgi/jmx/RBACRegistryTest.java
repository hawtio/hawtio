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
import java.util.Collections;
import java.util.List;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.not;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class RBACRegistryTest {

    public static Logger LOG = LoggerFactory.getLogger(RBACRegistryTest.class);

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
                "jmx.acl"
        );
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
                "jmx.acl"
        );

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

}
