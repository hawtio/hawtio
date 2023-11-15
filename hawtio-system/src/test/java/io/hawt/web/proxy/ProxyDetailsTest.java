package io.hawt.web.proxy;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ProxyDetailsTest {

    @Test
    public void testPathInfoWithUserPasswordPort() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/admin:admin@localhost/8181/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("admin", details.getUserName());
        assertEquals("admin", details.getPassword());
        assertEquals("localhost", details.getHost());
        assertEquals("localhost:8181", details.getHostAndPort());
        assertEquals(8181, details.getPort());
        assertEquals("/jolokia/", details.getProxyPath());
        assertEquals("http", details.getScheme());
        assertEquals("http://localhost:8181/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithUserPasswordDefaultPort() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/admin:admin@localhost//jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("admin", details.getUserName());
        assertEquals("admin", details.getPassword());
        assertEquals("localhost", details.getHost());
        assertEquals("localhost", details.getHostAndPort());
        assertEquals(80, details.getPort());
        assertEquals("/jolokia/", details.getProxyPath());
        assertEquals("http", details.getScheme());
        assertEquals("http://localhost/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithDefaultPort() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/localhost//jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("localhost", details.getHost());
        assertEquals("localhost", details.getHostAndPort());
        assertEquals(80, details.getPort());
        assertEquals("/jolokia/", details.getProxyPath());
        assertEquals("http", details.getScheme());
        assertEquals("http://localhost/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithPort() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/localhost/90/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);


        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("localhost", details.getHost());
        assertEquals("localhost:90", details.getHostAndPort());
        assertEquals(90, details.getPort());
        assertEquals("/jolokia/", details.getProxyPath());
        assertEquals("http", details.getScheme());
        assertEquals("http://localhost:90/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithWhitespace() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/http/localhost/10001/jolokia/read/java.lang:type=MemoryManager,name=Metaspace Manager/Name");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals(details.getFullProxyUrl(), "http://localhost:10001/jolokia/read/java.lang:type=MemoryManager,name=Metaspace%20Manager/Name", "getFullProxyUrl()");
    }

    @Test
    public void testDefaultPort() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123");

        ProxyDetails details = new ProxyDetails(mockReq);
        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("somerest-davsclaus2.rhcloud.com", details.getHost());
        assertEquals("somerest-davsclaus2.rhcloud.com", details.getHostAndPort());
        assertEquals(80, details.getPort());
        assertEquals("/cxf/crm/customerservice/customers/123", details.getProxyPath());
        assertEquals("http", details.getScheme());
        assertEquals("http://somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123", details.getFullProxyUrl());
    }

    @Test
    public void testHttpsUrl() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/443/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com:443", details.getHostAndPort());
        assertEquals(443, details.getPort());
        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com:443/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    @Disabled("auth-info not supported")
    public void testHttpsWithCredentialsUrl() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://test:user@www.myhost.com/443/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("test", details.getUserName());
        assertEquals("user", details.getPassword());
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com", details.getHostAndPort());
        assertEquals(443, details.getPort());
        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testHttpsUrlWithNoPort() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com", details.getHostAndPort());
        assertEquals(443, details.getPort());
        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    @Disabled("Mock code must support getParameterNames/getParameterValues")
    public void testWithQueryString() {

        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("foo=bar");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com", details.getHostAndPort());
        assertEquals(443, details.getPort());


        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com/myApp/jolokia/?foo=bar", details.getFullProxyUrl());
    }

    @Test
    public void testQueryStringWithIgnoredParameter() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("url=bar");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com", details.getHostAndPort());
        assertEquals(443, details.getPort());
        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testQueryStringWithMultipleIgnoredParameters() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("url=bar&_user=test");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com", details.getHostAndPort());
        assertEquals(443, details.getPort());
        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    @Disabled("Mock code must support getParameterNames/getParameterValues")
    public void testQueryStringWithMultipleIgnoredAndValidParameters() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("url=bar&search=1234&_user=test&page=4");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertNull(details.getUserName(), "getUserName()");
        assertNull(details.getPassword(), "getPassword()");
        assertEquals("www.myhost.com", details.getHost());
        assertEquals("www.myhost.com", details.getHostAndPort());
        assertEquals(443, details.getPort());
        assertEquals("/myApp/jolokia/", details.getProxyPath());
        assertEquals("https", details.getScheme());
        assertEquals("https://www.myhost.com/myApp/jolokia/?search=1234&page=4", details.getFullProxyUrl());
    }

    @Test
    public void testIsAllowed() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo())
            .thenReturn("/localhost/9000/jolokia/")
            .thenReturn("/localhost:8181/jolokia/")
            .thenReturn("/www.myhost.com/jolokia/")
            .thenReturn("/myhost1.com/jolokia/")
            .thenReturn("/myhost22.com/jolokia/")
            .thenReturn("/www.banned.com/jolokia/");

        Set<String> allowlist = new HashSet<>(Arrays.asList("localhost", "www.myhost.com"));
        List<Pattern> regexAllowlist = Collections.singletonList(Pattern.compile("myhost[0-9]+\\.com"));
        ProxyDetails details1 = new ProxyDetails(mockReq);
        ProxyDetails details2 = new ProxyDetails(mockReq);
        ProxyDetails details3 = new ProxyDetails(mockReq);
        ProxyDetails details4 = new ProxyDetails(mockReq);
        ProxyDetails details5 = new ProxyDetails(mockReq);
        ProxyDetails details6 = new ProxyDetails(mockReq);
        assertTrue(details1.isAllowed(allowlist), "localhost/9000");
        assertTrue(details2.isAllowed(allowlist), "localhost:8181");
        assertTrue(details3.isAllowed(allowlist), "www.myhost.com");
        assertTrue(details4.isAllowed(regexAllowlist), "myhost1.com");
        assertTrue(details5.isAllowed(regexAllowlist), "myhost22.com");
        assertFalse(details6.isAllowed(allowlist), "www.banned.com");
    }

    @Test
    public void testIsAllowedWithAllowAll() {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo())
            .thenReturn("/localhost/9000/jolokia/")
            .thenReturn("/www.myhost.com/jolokia/")
            .thenReturn("/www.banned.com/jolokia/");

        Set<String> allowlist = new HashSet<>(Collections.singletonList("*"));
        ProxyDetails details1 = new ProxyDetails(mockReq);
        ProxyDetails details2 = new ProxyDetails(mockReq);
        ProxyDetails details3 = new ProxyDetails(mockReq);
        assertTrue(details1.isAllowed(allowlist), "localhost");
        assertTrue(details2.isAllowed(allowlist), "www.myhost.com");
        assertTrue(details3.isAllowed(allowlist), "www.banned.com");
    }
}
