package io.hawt.util;

import java.net.InetAddress;
import java.util.Map;
import java.util.Set;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

public class HostsTest {

    @Test
    public void getNetworkInterfaceAddresses() {
        Map<String, Set<InetAddress>> includeLoopback = Hosts.getNetworkInterfaceAddresses(true);
        assertFalse(includeLoopback.isEmpty());
        assertLoopback("Should include loopback", true, includeLoopback);

        Map<String, Set<InetAddress>> noLoopback = Hosts.getNetworkInterfaceAddresses(false);
        assertFalse(noLoopback.isEmpty());
        assertLoopback("Should not include loopback", false, noLoopback);
    }

    private static void assertLoopback(String message, boolean expected, Map<String, Set<InetAddress>> actual) {
        boolean loopback = false;
        for (Set<InetAddress> addresses : actual.values()) {
            for (InetAddress address : addresses) {
                loopback = loopback || address.isLoopbackAddress();
            }
        }
        assertEquals(message, expected, loopback);
    }

    @Test
    public void getAddresses() {
        assertFalse(Hosts.getAddresses().isEmpty());
    }

    @Test
    public void getLocalHostName() throws Exception {
        assertNotNull(Hosts.getLocalHostName());
    }

    @Test
    public void getLocalIp() throws Exception {
        assertNotNull(Hosts.getLocalIp());

    }
}
