package io.hawt.springboot;

import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockMakers;
import org.mockito.Mockito;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.withSettings;


public class HawtioEndpointTest {

    private EndpointPathResolver resolver;
    private HawtioEndpoint hawtioEndpoint;
    private HttpServletRequest httpServletRequest;

    @BeforeEach
    public void setUp() {
        resolver = mock(EndpointPathResolver.class,withSettings().mockMaker(MockMakers.SUBCLASS));


        hawtioEndpoint = new HawtioEndpoint(resolver);
        httpServletRequest = mock(HttpServletRequest.class,withSettings().mockMaker(MockMakers.SUBCLASS));
    }

    @Test
    public void testForwardHawtioRequestToIndexHtml() {
        Mockito.when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        Mockito.when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio/");
        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml(httpServletRequest);
        Assertions.assertEquals("forward:/actuator/hawtio/index.html", result);
    }

    @Test
    public void testRedirectHawtioInvalidRequest() {
        Mockito.when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        Mockito.when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio");
        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml(httpServletRequest);
        Assertions.assertEquals("redirect:/actuator/hawtio/", result);
    }
}
