/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;

/**
 * A helpful base class for MBeans
 */
public abstract class MBeanSupport {
    private static final transient Logger LOG = LoggerFactory.getLogger(MBeanSupport.class);

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private boolean registered;

    public void init() throws Exception {
        // lets check if we have a config directory if not lets create one...
        // now lets expose the mbean...
        if (objectName == null) {
            objectName = new ObjectName(getDefaultObjectName());
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        if (!registered && !mBeanServer.isRegistered(objectName)) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                LOG.warn("This mbean is already registered " + objectName + ". There must be multiple deployment units with this mbean inside.");
/*
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
*/
            }
            registered = true;
        }
    }

    public void destroy() throws Exception {
        if (registered && objectName != null && mBeanServer != null) {
            registered = false;
            mBeanServer.unregisterMBean(objectName);
        }
    }


    public MBeanServer getMBeanServer() {
        return mBeanServer;
    }

    public void setMBeanServer(MBeanServer mBeanServer) {
        this.mBeanServer = mBeanServer;
    }

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
    }

    protected abstract String getDefaultObjectName();
}
