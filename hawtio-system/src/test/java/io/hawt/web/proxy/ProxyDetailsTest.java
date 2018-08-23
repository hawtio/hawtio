package io.hawt.web.proxy;

import java.util.*;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
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
        assertEquals("getFullProxyUrl()", "http://localhost:8181/jolokia/", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "http://localhost/jolokia/", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "http://localhost/jolokia/", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "http://localhost:90/jolokia/", details.getFullProxyUrl());
    }

    @Test
    public void testPathInfoWithWhitespace() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/http/localhost/10001/jolokia/read/java.lang:type=MemoryManager,name=Metaspace Manager/Name");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getFullProxyUrl()", "http://localhost:10001/jolokia/read/java.lang:type=MemoryManager,name=Metaspace%20Manager/Name", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "http://somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123", details.getFullProxyUrl());
    }

    @Test
    public void testHttpsUrl() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo()).thenReturn("/https://www.myhost.com/443/myApp/jolokia/");

        ProxyDetails details = new ProxyDetails(mockReq);

        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "www.myhost.com", details.getHost());
        assertEquals("getHostAndPort()", "www.myhost.com:443", details.getHostAndPort());
        assertEquals("getPort()", 443, details.getPort());
        assertEquals("getProxyPath()", "/myApp/jolokia/", details.getProxyPath());
        assertEquals("getScheme()", "https", details.getScheme());
        assertEquals("getFullProxyUrl()", "https://www.myhost.com:443/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    @Ignore("auth-info not supported")
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
        assertEquals("getFullProxyUrl()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    @Ignore("Mock code must support getParameterNames/getParameterValues")
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
        assertEquals("getFullProxyUrl()", "https://www.myhost.com/myApp/jolokia/?foo=bar", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
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
        assertEquals("getFullProxyUrl()", "https://www.myhost.com/myApp/jolokia/", details.getFullProxyUrl());
    }

    @Test
    @Ignore("Mock code must support getParameterNames/getParameterValues")
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
        assertEquals("getFullProxyUrl()", "https://www.myhost.com/myApp/jolokia/?search=1234&page=4", details.getFullProxyUrl());
    }

    @Test
    public void testIsAllowed() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo())
            .thenReturn("/localhost/9000/jolokia/")
            .thenReturn("/localhost:8181/jolokia/")
            .thenReturn("/www.myhost.com/jolokia/")
            .thenReturn("/myhost1.com/jolokia/")
            .thenReturn("/myhost22.com/jolokia/")
            .thenReturn("/www.banned.com/jolokia/");

        Set<String> whitelist = new HashSet<>(Arrays.asList("localhost", "www.myhost.com"));
        List<Pattern> regexWhitelist = Collections.singletonList(Pattern.compile("myhost[0-9]+\\.com"));
        ProxyDetails details1 = new ProxyDetails(mockReq);
        ProxyDetails details2 = new ProxyDetails(mockReq);
        ProxyDetails details3 = new ProxyDetails(mockReq);
        ProxyDetails details4 = new ProxyDetails(mockReq);
        ProxyDetails details5 = new ProxyDetails(mockReq);
        ProxyDetails details6 = new ProxyDetails(mockReq);
        assertTrue("localhost/9000", details1.isAllowed(whitelist));
        assertTrue("localhost:8181", details2.isAllowed(whitelist));
        assertTrue("www.myhost.com", details3.isAllowed(whitelist));
        assertTrue("myhost1.com", details4.isAllowed(regexWhitelist));
        assertTrue("myhost22.com", details5.isAllowed(regexWhitelist));
        assertFalse("www.banned.com", details6.isAllowed(whitelist));
    }

    @Test
    public void testIsAllowedWithAllowAll() throws Exception {
        HttpServletRequest mockReq = mock(HttpServletRequest.class);
        when(mockReq.getPathInfo())
            .thenReturn("/localhost/9000/jolokia/")
            .thenReturn("/www.myhost.com/jolokia/")
            .thenReturn("/www.banned.com/jolokia/");

        Set<String> whitelist = new HashSet<>(Arrays.asList("*"));
        ProxyDetails details1 = new ProxyDetails(mockReq);
        ProxyDetails details2 = new ProxyDetails(mockReq);
        ProxyDetails details3 = new ProxyDetails(mockReq);
        assertTrue("localhost", details1.isAllowed(whitelist));
        assertTrue("www.myhost.com", details2.isAllowed(whitelist));
        assertTrue("www.banned.com", details3.isAllowed(whitelist));
    }
}
