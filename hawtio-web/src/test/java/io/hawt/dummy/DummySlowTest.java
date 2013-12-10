package io.hawt.dummy;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DummySlowTest {

    private static final Logger LOG = LoggerFactory.getLogger(DummySlowTest.class);

    @Before
    public void init() throws Exception {
        LOG.info("Init test");
    }

    @After
    public void destroy() throws Exception {
        LOG.info("Destroy test");
    }

    @Test
    public void testSlow() throws Exception {
        // TODO: detect mbean and only do if jmx detected
        for (int i = 0; i < 30; i++) {
            LOG.info("Testing slow method iteration {}", i);
            Thread.sleep(1000);
        }
    }

}
