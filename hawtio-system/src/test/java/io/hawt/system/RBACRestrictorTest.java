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
package io.hawt.system;

import java.util.Arrays;

import javax.management.InstanceNotFoundException;
import javax.management.ObjectName;

import io.hawt.jmx.JMXSecurity;
import org.jolokia.config.Configuration;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class RBACRestrictorTest {

    private static final Logger LOG = LoggerFactory.getLogger(RBACRestrictorTest.class);

    private JMXSecurity mockJMXSecurity;

    @Before
    public void setUp() throws Exception {
        this.mockJMXSecurity = new MockJMXSecurity();
        this.mockJMXSecurity.init();
    }

    @After
    public void tearDown() throws Exception {
        this.mockJMXSecurity.destroy();
        this.mockJMXSecurity = null;
    }

    @Test
    public void noJMXSecurityMBean() throws Exception {
        // make sure no JMXSecurity MBean is registered
        this.mockJMXSecurity.destroy();
        RBACRestrictor restrictor = new RBACRestrictor(new Configuration());
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "anyMethod(java.lang.String)"), is(true));
        assertThat(restrictor.isAttributeReadAllowed(new ObjectName("java.lang:type=Runtime"), "VmName"), is(true));
        assertThat(restrictor.isAttributeWriteAllowed(new ObjectName("java.lang:type=Runtime"), "VmName"), is(true));
    }

    @Test
    public void isOperationAllowed() throws Exception {
        RBACRestrictor restrictor = new RBACRestrictor(new Configuration());

        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "allowed()"), is(true));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "notAllowed()"), is(false));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "error()"), is(false));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=NoSuchType"), "noInstance()"), is(false));

        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "allowed(boolean,long,java.lang.String)"), is(true));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "notAllowed(boolean,long,java.lang.String)"), is(false));
    }

    @Test
    public void isAttributeReadAllowed() throws Exception {
        RBACRestrictor restrictor = new RBACRestrictor(new Configuration());
        assertThat(restrictor.isAttributeReadAllowed(new ObjectName("java.lang:type=Runtime"), "VmName"), is(true));
        assertThat(restrictor.isAttributeReadAllowed(new ObjectName("java.lang:type=Memory"), "Verbose"), is(true));
        assertThat(restrictor.isAttributeReadAllowed(new ObjectName("java.lang:type=Runtime"), "VmVersion"), is(false));
        assertThat(restrictor.isAttributeReadAllowed(new ObjectName("java.lang:type=Runtime"), "xxx"), is(false));
        assertThat(restrictor.isAttributeReadAllowed(new ObjectName("hawtio:type=NoSuchType"), "Whatever"), is(false));
    }

    @Test
    public void isAttributeWriteAllowed() throws Exception {
        RBACRestrictor restrictor = new RBACRestrictor(new Configuration());
        assertThat(restrictor.isAttributeWriteAllowed(new ObjectName("java.lang:type=Memory"), "Verbose"), is(true));
        assertThat(restrictor.isAttributeWriteAllowed(new ObjectName("java.lang:type=Runtime"), "VmVersion"), is(false));
        assertThat(restrictor.isAttributeWriteAllowed(new ObjectName("java.lang:type=Runtime"), "xxx"), is(false));
        assertThat(restrictor.isAttributeWriteAllowed(new ObjectName("hawtio:type=NoSuchType"), "Whatever"), is(false));
    }

    private static class MockJMXSecurity extends JMXSecurity {
        @Override
        public boolean canInvoke(String objectName, String methodName) {
            return false;
        }

        @Override
        public boolean canInvoke(String objectName, String methodName, String[] argTypes) throws Exception {
            LOG.debug("{}, {}, {}", objectName, methodName, Arrays.asList(argTypes));
            if (argTypes.length == 0) {
                if ("hawtio:type=Test".equals(objectName) && "allowed".equals(methodName)) {
                    return true;
                }
                if ("hawtio:type=Test".equals(objectName) && "error".equals(methodName)) {
                    throw new Exception();
                }
                if ("hawtio:type=NoSuchType".equals(objectName) && "noInstance".equals(methodName)) {
                    throw new InstanceNotFoundException(objectName);
                }
                if ("java.lang:type=Runtime".equals(objectName) && "getVmName".equals(methodName)) {
                    return true;
                }
                if ("java.lang:type=Memory".equals(objectName) && "isVerbose".equals(methodName)) {
                    return true;
                }
            } else {
                if ("hawtio:type=Test".equals(objectName) && "allowed".equals(methodName) && argTypes.length == 3
                    && "boolean".equals(argTypes[0]) && "long".equals(argTypes[1]) && "java.lang.String".equals(argTypes[2])) {
                    return true;
                }
                if ("java.lang:type=Memory".equals(objectName) && "setVerbose".equals(methodName) && argTypes.length == 1
                    && "boolean".equals(argTypes[0])) {
                    return true;
                }
            }
            return false;
        }

        @Override
        protected String getDefaultObjectName() {
            return "hawtio:type=security,area=jmx,name=MockJMXSecurity";
        }
    }

}
