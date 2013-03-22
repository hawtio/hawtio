package io.hawt.example.infinispan;

import org.infinispan.Cache;

/**
 * Loads a little bit of data into infinispan so we can play with it in hawtio
 */
public class InfinispanDemo {
    private Cache<Object, Object> food;
    private Cache<Object, Object> drink;

    public void init() {
        // kinda dodgy example data, hadn't had much coffee...
        food = SampleCacheContainer.getCache("food");
        food.put("curry", "Needs beer");
        food.put("meat", "Maybe red wine");

        drink = SampleCacheContainer.getCache("drink");
        drink.put("beer", "Great with curry, or any other time really");
        drink.put("wine", "Nice with cheese");

    }
}
