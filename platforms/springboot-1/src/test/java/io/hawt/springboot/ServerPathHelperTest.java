package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;
import org.springframework.boot.actuate.autoconfigure.ManagementServerProperties;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ServerPathHelperTest {

    private ServerProperties serverProperties;
    private ManagementServerProperties managementServerProperties;
    private ServerPathHelper helper;

    @Before
    public void setUp() {
        serverProperties = mock(ServerProperties.class);
        managementServerProperties = mock(ManagementServerProperties.class);
        helper = new ServerPathHelper(serverProperties, managementServerProperties);
    }

    @Test
    public void testGetBasePath() {
        assertEquals("", helper.getBasePath());
    }

    @Test
    public void testGetBasePathWithManagementContext() {
        when(managementServerProperties.getContextPath()).thenReturn("/context");
        assertEquals("/context", helper.getBasePath());
    }

    @Test
    public void testGetBasePathWithServletPrefix() {
        when(serverProperties.getServletPrefix()).thenReturn("/prefix");
        assertEquals("/prefix", helper.getBasePath());
    }

    @Test
    public void testGetBasePathWithServletPrefixAndManagementContext() {
        when(serverProperties.getServletPrefix()).thenReturn("/prefix");
        when(managementServerProperties.getContextPath()).thenReturn("/context");
        assertEquals("/prefix/context", helper.getBasePath());
    }

    @Test
    public void testGetBasePathWhenMangementPortNotEqualsServerPort() {
        when(serverProperties.getPort()).thenReturn(8080);
        when(managementServerProperties.getPort()).thenReturn(8081);
        when(serverProperties.getServletPrefix()).thenReturn("/prefix");
        when(managementServerProperties.getContextPath()).thenReturn("/context");
        assertEquals("/context", helper.getBasePath());
    }

    @Test
    public void testGetResourceHandlerPath() {
        assertEquals("/resource", helper.getResourceHandlerPathFor("/resource"));
        assertEquals("/resource/**", helper.getResourceHandlerPathFor("/resource/**"));
    }

    @Test
    public void testGetResourceHandlerPathWithManagementContext() {
        when(managementServerProperties.getContextPath()).thenReturn("/context");
        assertEquals("/context/resource", helper.getResourceHandlerPathFor("/resource"));
        assertEquals("/context/resource/**", helper.getResourceHandlerPathFor("/resource/**"));
    }

    @Test
    public void testGetPathFor() {
        assertEquals("/hawtio", helper.getPathFor("/hawtio"));
        assertEquals("/hawtio/jolokia", helper.getPathFor("/hawtio/jolokia"));
    }

    @Test
    public void testGetPathForWithManagementContext() {
        when(managementServerProperties.getContextPath()).thenReturn("/context");
        assertEquals("/context/hawtio", helper.getPathFor("/hawtio"));
        assertEquals("/context/hawtio/jolokia", helper.getPathFor("/hawtio/jolokia"));
    }
}
