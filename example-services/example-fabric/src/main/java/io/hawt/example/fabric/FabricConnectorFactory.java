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
