package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class HawtioEndpointTest {

    private ServerPathHelper serverPathHelper;
    private HawtioEndpoint hawtioEndpoint;

    @Before
    public void setUp() {
        serverPathHelper = mock(ServerPathHelper.class);
        hawtioEndpoint = new HawtioEndpoint(serverPathHelper);
    }

    @Test
    public void testGetIndexHtmlRedirect() {
        when(serverPathHelper.getPathFor("/hawtio")).thenReturn("/hawtio");
        assertEquals("forward:/hawtio/index.html", hawtioEndpoint.forwardHawtioRequestToIndexHtml());
    }
}
