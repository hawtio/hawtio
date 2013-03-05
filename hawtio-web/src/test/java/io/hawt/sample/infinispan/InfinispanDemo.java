package io.hawt.sample.infinispan;

import org.infinispan.Cache;

/**
 * Loads a little bit of data into infinispan so we can see it
 */
public class InfinispanDemo {
    public void run() {

        // kinda dodgy example data, hadn't had much coffee...
        Cache<Object,Object> food = SampleCacheContainer.getCache("food");
        food.put("curry", "Needs beer");
        food.put("meat", "Maybe red wine");

        Cache<Object,Object> drink = SampleCacheContainer.getCache("drink");
        drink.put("beer", "Great with curry, or any other time really");
        drink.put("wine", "Nice with cheese");

    }
}
