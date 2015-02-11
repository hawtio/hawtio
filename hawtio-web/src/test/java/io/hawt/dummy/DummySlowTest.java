package io.hawt.dummy;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

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

    public static void main(String[] args) throws MalformedObjectNameException {
//        String name = "org.apache.camel/context=camel-1,type=routes,name=fileInputRoute from file:src/test/data\\noop=true";
//        String quoted = ObjectName.quote("file from file:src/text/data?noop=true");
//        String name = "org.apache.camel:context=bar,type=context,name=" + quoted;

//        ObjectName on = ObjectName.getInstance(name);
//        System.out.println(on);

        String quoted = ObjectName.quote("fileInputRoute from file:src//test/data?noop=true");
        System.out.println(quoted);

        String other = "org.apache.camel/context=camel-1,type=routes,name=" + quoted;
        ObjectName on2 = ObjectName.getInstance(other);
        System.out.println(on2);

        String s = "org.apache.camel:context=camel-1,type=endpoints,name=\"file://src/test/data\\?noop=true\"";
        ObjectName on3 = ObjectName.getInstance(s);
        System.out.println(on3);


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
