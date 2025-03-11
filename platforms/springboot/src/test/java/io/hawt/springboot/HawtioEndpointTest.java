package io.hawt.springboot;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.ModelAndView;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class HawtioEndpointTest {

    private EndpointPathResolver resolver;
    private HawtioEndpoint hawtioEndpoint;
    private HttpServletRequest httpServletRequest;

    @BeforeEach
    public void setUp() {
        resolver = mock(EndpointPathResolver.class);
        hawtioEndpoint = new HawtioEndpoint(resolver);
        httpServletRequest = mock(HttpServletRequest.class);
    }

    @Test
    public void testRedirectHawtioRequestToIndexHtml() {
        when(resolver.resolveUrlMapping("hawtio")).thenReturn("/actuator/hawtio");
        when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio/");
        ModelAndView result = hawtioEndpoint.hawtio();
        assertEquals("redirect:/actuator/hawtio/index.html", result.getViewName());
    }
}
