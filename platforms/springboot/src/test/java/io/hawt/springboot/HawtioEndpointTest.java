package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import javax.servlet.http.HttpServletRequest;

import static org.junit.Assert.assertEquals;

public class HawtioEndpointTest {

    private EndpointPathResolver resolver;
    private HawtioEndpoint hawtioEndpoint;
    private HttpServletRequest httpServletRequest;

    @Before
    public void setUp() {
        resolver = Mockito.mock(EndpointPathResolver.class);
        hawtioEndpoint = new HawtioEndpoint(resolver);
        httpServletRequest = Mockito.mock(HttpServletRequest.class);
    }

    @Test
    public void testForwardHawtioRequestToIndexHtml() {
        Mockito.when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        Mockito.when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio/");
        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml(httpServletRequest);
        assertEquals("forward:/actuator/hawtio/index.html", result);
    }

    @Test
    public void testRedirectHawtioInvalidRequest() {
        Mockito.when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        Mockito.when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio");
        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml(httpServletRequest);
        assertEquals("redirect:/actuator/hawtio/", result);
    }
}
