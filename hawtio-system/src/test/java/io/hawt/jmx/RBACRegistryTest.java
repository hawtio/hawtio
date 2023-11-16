package io.hawt.jmx;

import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;

public class RBACRegistryTest {

    private final RBACRegistry rbacRegistry = new RBACRegistry();

    @BeforeEach
    public void init() throws Exception {
        rbacRegistry.init();
    }

    @AfterEach
    public void destroy() throws Exception {
        rbacRegistry.destroy();
    }

    private static void assertResult(Map<String, Object> result) {
        assertThat(result.get("cache"), notNullValue());
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> domains = (Map<String, Map<String, Object>>) result.get("domains");
        assertThat(domains, notNullValue());
        Map<String, Object> hawtioDomain = domains.get("hawtio");
        assertThat(hawtioDomain, notNullValue());
        assertThat(hawtioDomain.get("type=security,name=RBACRegistry"), notNullValue());
    }

    @Test
    public void list() throws Exception {
        Map<String, Object> result = rbacRegistry.list();
        assertResult(result);
    }

    @Test
    public void listWithExistingDomainPath() throws Exception {
        Map<String, Object> result = rbacRegistry.list("hawtio");
        assertResult(result);
    }

    @Test
    public void listWithExistingMBeanPath() throws Exception {
        Map<String, Object> result = rbacRegistry.list("hawtio/type=security,name=RBACRegistry");
        assertResult(result);
    }

    @Test
    public void listWithNonExistingPath() throws Exception {
        Map<String, Object> result = rbacRegistry.list("hawtio/name=NoSuchMBean");
        assertThat(result.get("cache"), notNullValue());
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> domains = (Map<String, Map<String, Object>>) result.get("domains");
        assertThat(domains, notNullValue());
        assertThat(domains.isEmpty(), is(true));
    }

}
