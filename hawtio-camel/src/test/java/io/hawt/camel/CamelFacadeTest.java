package io.hawt.camel;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;


public class CamelFacadeTest {
    CamelFacade facade = new CamelFacade();

    @Before
    public void init() throws Exception {
        facade.init();
        facade.setConciseErrors(true);
    }

    @After
    public void destroy() throws Exception {
        facade.destroy();
    }

    @Test
    public void testWeCanFindCustomEndpoints() throws Exception {
        String json = facade.findCustomEndpointsJson();
        System.out.println("JSON: " + json);
    }
}
