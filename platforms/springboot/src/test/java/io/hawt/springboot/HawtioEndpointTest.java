package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.Assert.assertEquals;

public class HawtioEndpointTest {

    private HawtioEndpoint hawtioEndpoint;

    @Before
    public void setUp() {
        hawtioEndpoint = new HawtioEndpoint(null);
    }

    @Test
    public void testGetIndexHtmlRedirect() {
        runTestGetIndexHtmlRedirect(null, null,
            "forward:/index.html");
        runTestGetIndexHtmlRedirect("", "",
            "forward:/index.html");
        runTestGetIndexHtmlRedirect("/hawtio", null,
            "forward:/hawtio/index.html");
        runTestGetIndexHtmlRedirect("/hawtio/", null,
            "forward:/hawtio/index.html");
    }

    private void runTestGetIndexHtmlRedirect(String requestURI, String queryString, String expectedResult) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (requestURI != null) {
            request.setRequestURI(requestURI);
        }
        if (queryString != null) {
            request.setQueryString(queryString);
        }

        String result = hawtioEndpoint.getIndexHtmlRedirect(request);

        assertEquals(expectedResult, result);
    }

}
