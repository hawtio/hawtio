package io.hawt.example.infinispan;

import org.infinispan.Cache;
import org.infinispan.manager.DefaultCacheManager;
import org.infinispan.manager.EmbeddedCacheManager;

import java.io.IOException;

/**
 * This sample cache container acts as a factory and a mechanism with which to create and configure an embedded cache
 * manager, and to hold this cache manager such that other code can access it.
 *
 * Variants of this pattern include storing the EmbeddedCacheManager in JNDI or as a bean in JMX, or even using CDI
 * or some other dependency injection framework to hold the cache manager (and even cache) references and inject them
 * as needed into various bits of application code.
 */
public class SampleCacheContainer {

   // ************************************************************************************************************
   // This should point to the Infinispan configuration file.  Either an absolute path or the name of a config
   // file in your classpath could be used.  See http://community.jboss.org/wiki/Configuringcache for more details.
   // ************************************************************************************************************

   // This skeleton project ships with 4 different Infinispan configurations.  Uncomment the one most appropriate to you.
   private static final String INFINISPAN_CONFIGURATION = "infinispan-local.xml";
//   private static final String INFINISPAN_CONFIGURATION = "infinispan-clustered-tcp.xml";
//   private static final String INFINISPAN_CONFIGURATION = "infinispan-clustered-udp.xml";
//   private static final String INFINISPAN_CONFIGURATION = "infinispan-clustered-ec2.xml";

   private static final EmbeddedCacheManager CACHE_MANAGER;

   static {
      try {
         CACHE_MANAGER = new DefaultCacheManager(INFINISPAN_CONFIGURATION);
      } catch (IOException e) {
         throw new RuntimeException("Unable to configure Infinispan", e);
      }
   }

   /**
    * Retrieves the default cache.
    * @param <K> type used as keys in this cache
    * @param <V> type used as values in this cache
    * @return a cache
    */
   public static <K, V> Cache<K, V> getCache() {
      return CACHE_MANAGER.getCache();
   }

   /**
    * Retrieves a named cache.
    * @param cacheName name of cache to retrieve
    * @param <K> type used as keys in this cache
    * @param <V> type used as values in this cache
    * @return a cache
    */
   public static <K, V> Cache<K, V> getCache(String cacheName) {
      if (cacheName == null) throw new NullPointerException("Cache name cannot be null!");
      return CACHE_MANAGER.getCache(cacheName);
   }

   /**
    * Retrieves the embedded cache manager.
    * @return a cache manager
    */
   public static EmbeddedCacheManager getCacheContainer() {
      return CACHE_MANAGER;
   }
}
