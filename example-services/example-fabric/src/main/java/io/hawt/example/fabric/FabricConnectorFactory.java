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
package io.hawt.example.fabric;

import io.fabric8.api.PlaceholderResolver;
import io.fabric8.service.ChecksumPlaceholderResolver;
import io.fabric8.service.FabricServiceImpl;
import io.fabric8.service.ZooKeeperDataStore;
import io.fabric8.service.ZookeeperPlaceholderResolver;
import io.fabric8.zookeeper.IZKClient;
import io.fabric8.zookeeper.spring.ZKClientFactoryBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.List;

/**
 * A simple factory bean that creates a connection to Fuse Fabric
 */
public class FabricConnectorFactory {
    private static final transient Logger LOG = LoggerFactory.getLogger(FabricConnectorFactory.class);

    public void init() throws Exception {
        MBeanServer mbeanServer = ManagementFactory.getPlatformMBeanServer();
        String fabricUrl = System.getProperty("fabricUrl", "");
        String fabricPassword = System.getProperty("fabricPassword", "admin");

        if (fabricUrl != null && fabricUrl.length() > 0) {
            LOG.info("Connecting to Fuse Fabric at " + fabricUrl);
            ZKClientFactoryBean factory = new ZKClientFactoryBean();
            factory.setPassword(fabricPassword);
            factory.setConnectString(fabricUrl);
            IZKClient zooKeeper = factory.getObject();
            FabricServiceImpl impl = new FabricServiceImpl();
            impl.setZooKeeper(zooKeeper);
            impl.bindMBeanServer(mbeanServer);
            //impl.init();
            ZooKeeperDataStore dataStore = new ZooKeeperDataStore();
            dataStore.setZk(zooKeeper);


            ZookeeperPlaceholderResolver zookeeperPlaceholderResolver = new ZookeeperPlaceholderResolver();
            zookeeperPlaceholderResolver.setZooKeeper(zooKeeper);

            List<PlaceholderResolver> placeholderResolvers = new ArrayList<PlaceholderResolver>();
            placeholderResolvers.add(new ChecksumPlaceholderResolver());
            placeholderResolvers.add(zookeeperPlaceholderResolver);

            dataStore.setPlaceholderResolvers(placeholderResolvers);
            impl.setDataStore(dataStore);
        }
    }

    public void destroy() {
    }
}
