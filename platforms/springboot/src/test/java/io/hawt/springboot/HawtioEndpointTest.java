package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.Assert.assertEquals;

public class HawtioEndpointTest {

    private HawtioEndpoint hawtioEndpoint;

    @Before
    public void setUp() {
        hawtioEndpoint = new HawtioEndpoint("/hawtio");
    }

    @Test
    public void testGetIndexHtmlRedirect() {
        runTestGetIndexHtmlRedirect(null, null,
            "redirect:http://localhost/index.html");
        runTestGetIndexHtmlRedirect("", "",
            "redirect:http://localhost/index.html");
        runTestGetIndexHtmlRedirect("/hawtio", null,
            "redirect:http://localhost/hawtio/index.html");
        runTestGetIndexHtmlRedirect("/hawtio/", null,
            "redirect:http://localhost/hawtio/index.html");
        runTestGetIndexHtmlRedirect("/hawtio", "param1=value1",
            "redirect:http://localhost/hawtio/index.html?param1=value1");
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
