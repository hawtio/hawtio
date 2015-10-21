package io.hawt.log.log4j;

import junit.framework.TestCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Log4jLogQueryTest extends TestCase {

    private static final transient Logger LOG = LoggerFactory.getLogger(Log4jLogQueryTest.class);
    private Log4jLogQuery logQuery;

    public void testLog4j() throws Exception {
        logQuery = new Log4jLogQuery();
        logQuery.start();

        int size = logQuery.getEvents().size();

        LOG.info("Hello hawtio");

        int size2 = logQuery.getEvents().size();

        assertTrue("There should be more logging events", size2 > size);

        logQuery.stop();

    }
}
