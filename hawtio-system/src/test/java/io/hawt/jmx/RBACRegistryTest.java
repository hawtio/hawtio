package io.hawt.jmx;

import java.util.Map;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;

public class RBACRegistryTest {

    private final RBACRegistry rbacRegistry = new RBACRegistry();

    @Before
    public void init() throws Exception {
        rbacRegistry.init();
    }

    @After
    public void destroy() throws Exception {
        rbacRegistry.destroy();
    }

    @Test
    @SuppressWarnings("unchecked")
    public void list() throws Exception {
        Map<String, Object> result = rbacRegistry.list();

        assertThat(result.get("cache"), notNullValue());
        Map<String, Map<String, Object>> domains = (Map<String, Map<String, Object>>) result.get("domains");
        assertThat(domains, notNullValue());
        Map<String, Object> hawtioDomain = domains.get("hawtio");
        assertThat(hawtioDomain, notNullValue());
        assertThat(hawtioDomain.get("type=security,name=RBACRegistry"), notNullValue());
    }

}
