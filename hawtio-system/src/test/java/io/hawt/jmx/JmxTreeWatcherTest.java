package io.hawt.jmx;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class JmxTreeWatcherTest {
    JmxTreeWatcher treeWatcher = new JmxTreeWatcher();

    @Before
    public void init() throws Exception {
        treeWatcher.init();
    }

    @After
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
        assertTrue("Counter: " + value1 + " should be less than counter2 = " + value2, value1 < value2);
    }
}
