package io.hawt.jmx;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class JmxTreeWatcherTest {
    JmxTreeWatcher treeWatcher = new JmxTreeWatcher();

    @BeforeEach
    public void init() throws Exception {
        treeWatcher.init();
    }

    @AfterEach
    public void destroy() throws Exception {
        treeWatcher.destroy();
    }

    @Test
    public void testNotificationsOnNewMBeans() throws Exception {
        long value1 = treeWatcher.getCounter();

        // now lets register a new mbean
        About about = new About();
        about.init();

        long value2 = treeWatcher.getCounter();
        assertCounterGreater(value1, value2);
        about.destroy();

        long value3 = treeWatcher.getCounter();
        assertCounterGreater(value2, value3);
    }

    private void assertCounterGreater(long value1, long value2) {
        assertTrue(value1 < value2, "Counter: " + value1 + " should be less than counter2 = " + value2);
    }
}
