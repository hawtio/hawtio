package io.hawt.web;

import org.junit.Test;

import javax.servlet.http.HttpServletRequest;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ProxyDetailsTest {

    @Test
    public void testPathInfoWithUserPasswordPort() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/admin:admin@localhost/8181/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", "admin", details.getUserName());
        assertEquals("getPassword()", "admin", details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost:8181", details.getHostAndPort());
        assertEquals("getPort()", 8181, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "http", details.getScheme());
        assertEquals("getStringProxyURL()", "http://localhost:8181/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithUserPasswordDefaultPort() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/admin:admin@localhost//jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", "admin", details.getUserName());
        assertEquals("getPassword()", "admin", details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost", details.getHostAndPort());
        assertEquals("getPort()", 80, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "http", details.getScheme());
        assertEquals("getStringProxyURL()", "http://localhost/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithDefaultPort() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/localhost//jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost", details.getHostAndPort());
        assertEquals("getPort()", 80, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "http", details.getScheme());
        assertEquals("getStringProxyURL()", "http://localhost/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithPort() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/localhost/90/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);
        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost:90", details.getHostAndPort());
        assertEquals("getPort()", 90, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "http", details.getScheme());
        assertEquals("getStringProxyURL()", "http://localhost:90/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testDefaultPort() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123");

        ProxyDetails details = new ProxyDetails(mockReq);
        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "somerest-davsclaus2.rhcloud.com", details.getHost());
        assertEquals("getHostAndPort()", "somerest-davsclaus2.rhcloud.com", details.getHostAndPort());
        assertEquals("getPort()", 80, details.getPort());
        assertEquals("getProxyPath()", "/cxf/crm/customerservice/customers/123", details.getProxyPath());
        assertEquals("getScheme()", "http", details.getScheme());
        assertEquals("getStringProxyURL()", "http://somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123", details.getFullProxyUrl());
    }

    @Test
    public void testHttpsUrl() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/443/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testHttpsWithCredentialsUrl() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://test:user@www.myhost.com/443/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", "test", details.getUserName());
        assertEquals("getPassword()", "user", details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testHttpsUrlWithNoPort() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testWithQueryString() throws Exception {

        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("foo=bar");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/?foo=bar", details.getFullProxyUrl());
    }

    @Test
    public void testQueryStringWithIgnoredParameter() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("url=bar");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testQueryStringWithMultipleIgnoredParameters() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("url=bar&_user=test");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testQueryStringWithMultipleIgnoredAndValidParameters() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/myApp/jolokia/");
        when(mockReq.getQueryString()).thenReturn("url=bar&search=1234&_user=test&page=4");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getStringProxyURL()", "https://www.myhost.com/myApp/jolokia/?search=1234&page=4", details.getFullProxyUrl());
    }
}
