package io.hawt.web.auth;

import org.junit.Before;
import org.junit.Test;

import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class LoginRedirectFilterTest {

    private LoginRedirectFilter loginRedirectFilter;
    private FilterConfig filterConfig;
    private ServletContext servletContext;

    @Before
    public void setUp() {
        loginRedirectFilter = new LoginRedirectFilter();
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
    }

    @Test
    public void shouldConvertToList() {
        assertEquals(Collections.EMPTY_LIST, loginRedirectFilter.convertCsvToList(null));
        assertEquals(Collections.EMPTY_LIST, loginRedirectFilter.convertCsvToList(""));
        assertEquals(Collections.EMPTY_LIST, loginRedirectFilter.convertCsvToList(" "));
        assertEquals(Arrays.asList("/a"), loginRedirectFilter.convertCsvToList("/a"));
        assertEquals(Arrays.asList("/a", "/b"), loginRedirectFilter.convertCsvToList("/a,/b"));
        assertEquals(Arrays.asList("/a", "/b", "/c"), loginRedirectFilter.convertCsvToList("/a,/b,/c"));
    }

    @Test
    public void shouldTestSecuredPaths() throws Exception {
        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when((filterConfig.getInitParameter("unsecuredPaths"))).thenReturn("/a,/b,/c");
        loginRedirectFilter.init(filterConfig);
        assertTrue(loginRedirectFilter.isSecuredPath("/d"));
        assertTrue(loginRedirectFilter.isSecuredPath("/e/f"));
        assertFalse(loginRedirectFilter.isSecuredPath("/a"));
        assertFalse(loginRedirectFilter.isSecuredPath("/b/b"));
    }

}
