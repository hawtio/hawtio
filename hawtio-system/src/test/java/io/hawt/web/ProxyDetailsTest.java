package io.hawt.web;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ProxyDetailsTest {

    @Test
    public void testPathInfoWithUserPasswordPort() throws Exception {
        ProxyDetails details = new ProxyDetails("/admin:admin@localhost/8181/jolokia/");
        assertEquals("getUserName()", "admin", details.getUserName());
        assertEquals("getPassword()", "admin", details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost:8181", details.getHostAndPort());
        assertEquals("getPort()", 8181, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getStringProxyURL()", "http://localhost:8181/jolokia/", details.getStringProxyURL());
    }

    @Test
    public void testPathInfoWithUserPasswordDefaultPort() throws Exception {
        ProxyDetails details = new ProxyDetails("/admin:admin@localhost//jolokia/");
        assertEquals("getUserName()", "admin", details.getUserName());
        assertEquals("getPassword()", "admin", details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost", details.getHostAndPort());
        assertEquals("getPort()", 80, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getStringProxyURL()", "http://localhost/jolokia/", details.getStringProxyURL());
    }

    @Test
    public void testPathInfoWithDefaultPort() throws Exception {
        ProxyDetails details = new ProxyDetails("/localhost//jolokia/");
        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost", details.getHostAndPort());
        assertEquals("getPort()", 80, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getStringProxyURL()", "http://localhost/jolokia/", details.getStringProxyURL());
    }

    @Test
    public void testPathInfoWithPort() throws Exception {
        ProxyDetails details = new ProxyDetails("/localhost/90/jolokia/");
        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "localhost", details.getHost());
        assertEquals("getHostAndPort()", "localhost:90", details.getHostAndPort());
        assertEquals("getPort()", 90, details.getPort());
        assertEquals("getProxyPath()", "/jolokia/", details.getProxyPath());
        assertEquals("getStringProxyURL()", "http://localhost:90/jolokia/", details.getStringProxyURL());
    }

    @Test
    public void testDefaultPort() throws Exception {
        ProxyDetails details = new ProxyDetails("/somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123");
        assertEquals("getUserName()", null, details.getUserName());
        assertEquals("getPassword()", null, details.getPassword());
        assertEquals("getHost()", "somerest-davsclaus2.rhcloud.com", details.getHost());
        assertEquals("getHostAndPort()", "somerest-davsclaus2.rhcloud.com", details.getHostAndPort());
        assertEquals("getPort()", 80, details.getPort());
        assertEquals("getProxyPath()", "/cxf/crm/customerservice/customers/123", details.getProxyPath());
        assertEquals("getStringProxyURL()", "http://somerest-davsclaus2.rhcloud.com/cxf/crm/customerservice/customers/123", details.getStringProxyURL());
    }

}
