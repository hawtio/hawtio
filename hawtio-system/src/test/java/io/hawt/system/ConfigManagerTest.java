package io.hawt.system;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConfigManagerTest {

    @BeforeEach
    public void setUp() {
        System.clearProperty("hawtio.foo");
    }

    @AfterEach
    public void tearDown() {
        System.clearProperty("hawtio.foo");
    }

    @Test
    public void testGet() {
        System.setProperty("hawtio.foo", "bar");
        ConfigManager underTest = new ConfigManager();
        assertEquals(Optional.of("bar"), underTest.get("foo"));
    }

    @Test
    public void testGetWithDefaultValue() {
        ConfigManager underTest = new ConfigManager();
        assertEquals(Optional.empty(), underTest.get("foo"));
    }

    @Test
    public void testGetWithCustomProvider() {
        ConfigManager underTest = new ConfigManager(x -> "foo".equals(x) ? "bar" : null);
        assertEquals(Optional.of("bar"), underTest.get("foo"));
    }

    @Test
    public void testGetWithCustomProviderOverriddenBySystemProperty() {
        System.setProperty("hawtio.foo", "system");
        ConfigManager underTest = new ConfigManager(x -> "foo".equals(x) ? "bar" : null);
        assertEquals(Optional.of("system"), underTest.get("foo"));
    }
}
