package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import static org.junit.Assert.assertEquals;

public class HawtioEndpointTest {

    private EndpointPathResolver resolver;
    private HawtioEndpoint hawtioEndpoint;

    @Before
    public void setUp() {
        resolver = Mockito.mock(EndpointPathResolver.class);
        hawtioEndpoint = new HawtioEndpoint(resolver);
    }

    @Test
    public void testForwardHawtioRequestToIndexHtml() {
        Mockito.when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml();
        assertEquals("forward:/actuator/hawtio/index.html", result);
    }
}
