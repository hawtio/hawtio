/**
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
package io.hawt.example.groovyconsole;

import java.lang.management.ManagementFactory;
import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import groovy.lang.GroovyShell;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GroovyConsole implements GroovyConsoleMBean {

    private static final Logger LOG = LoggerFactory.getLogger(GroovyConsole.class);
    private MBeanServer mBeanServer;
    private ObjectName objectName;
    private GroovyShell shell;

    public GroovyConsole() {
        shell = new GroovyShell();
    }

    public void init() {
        if (objectName == null) {
            try {
                objectName = getObjectName();
            } catch (Exception e) {
                LOG.warn("Failed to create object name: ", e);
                throw new RuntimeException("Failed to create object name: ", e);
            }
        }

        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }

        if (mBeanServer != null) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch(InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                try {
                    mBeanServer.unregisterMBean(objectName);
                    mBeanServer.registerMBean(this, objectName);
                } catch (Exception e) {
                    LOG.warn("Failed to register mbean: ", e);
                    throw new RuntimeException("Failed to register mbean: ", e);
                }
            } catch (Exception e) {
                LOG.warn("Failed to register mbean: ", e);
                throw new RuntimeException("Failed to register mbean: ", e);
            }
        }

    }

    public void destroy() {
        if (mBeanServer != null && objectName != null) {
            try {
                mBeanServer.unregisterMBean(objectName);
            } catch (Exception e) {
                LOG.warn("Failed to unregister mbean: ", e);
                throw new RuntimeException("Failed to unregister mbean: ", e);
            }
        }
    }

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("hawtio:type=GroovyConsole");
    }

    @Override
    public String evaluate(String input) {
        Object out = shell.evaluate(input);
        if (out != null) {
            return out.toString();
        } else {
            return "[null]";
        }
    }
}
