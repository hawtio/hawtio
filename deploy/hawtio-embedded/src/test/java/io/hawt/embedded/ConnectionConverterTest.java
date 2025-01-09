package io.hawt.embedded;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ConnectionConverterTest {

    @Test
    void convert() throws Exception {
        var converter = new ConnectionConverter();

        var conn1 = converter.convert("http://localhost:12345/hawtio/jolokia/");
        assertFalse(conn1.isHttps());
        assertEquals("localhost", conn1.getHost());
        assertEquals(12345, conn1.getPort());
        assertEquals("/hawtio/jolokia/", conn1.getPath());

        var conn2 = converter.convert("https://example.com/jolokia/");
        assertTrue(conn2.isHttps());
        assertEquals("example.com", conn2.getHost());
        assertEquals(-1, conn2.getPort());
        assertEquals("/jolokia/", conn2.getPath());
    }
}
