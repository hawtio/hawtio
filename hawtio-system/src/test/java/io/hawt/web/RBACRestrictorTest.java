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

import io.hawt.jmx.JMXSecurity;
import org.jolokia.config.Configuration;
import org.junit.Test;

import javax.management.ObjectName;

import java.util.Arrays;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;


public class RBACRestrictorTest {

    @Test
    public void isOperationAllowed_noJMXSecurityMBean() throws Exception {
        RBACRestrictor restrictor = new RBACRestrictor(new Configuration());
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "anyMethod(java.lang.String)"), is(true));
    }

    @Test
    public void isOperationAllowed() throws Exception {
        new MockJMXSecurity().init();
        RBACRestrictor restrictor = new RBACRestrictor(new Configuration());

        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "allowed()"), is(true));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "notAllowed()"), is(false));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "error()"), is(false));

        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "allowed(boolean,long,java.lang.String)"), is(true));
        assertThat(restrictor.isOperationAllowed(new ObjectName("hawtio:type=Test"), "notAllowed(boolean,long,java.lang.String)"), is(false));
    }

    private class MockJMXSecurity extends JMXSecurity {
        @Override
        public boolean canInvoke(String objectName, String methodName) throws Exception {
            if ("hawtio:type=Test".equals(objectName) && "allowed".equals(methodName)) {
                return true;
            }
            if ("hawtio:type=Test".equals(objectName) && "error".equals(methodName)) {
                throw new Exception();
            }
            return false;
        }

        @Override
        public boolean canInvoke(String objectName, String methodName, String[] argTypes) throws Exception {
            if ("hawtio:type=Test".equals(objectName) && "allowed".equals(methodName) && argTypes.length == 3
                    && "boolean".equals(argTypes[0]) && "long".equals(argTypes[1]) && "java.lang.String".equals(argTypes[2])) {
                return true;
            }
            return false;
        }
    }

}