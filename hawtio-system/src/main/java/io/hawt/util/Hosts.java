/*
 *  Copyright 2005-2017 Red Hat, Inc.
 *
 *  Red Hat licenses this file to you under the Apache License, version
 *  2.0 (the "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *  implied.  See the License for the specific language governing
 *  permissions and limitations under the License.
 */
package io.hawt.util;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Copied from Fabric8 v1 io.fabric8.utils.HostUtils
 */
public class Hosts {
    private static final Logger LOG = LoggerFactory.getLogger(Hosts.class);

    public static final String PREFERED_ADDRESS_PROPERTY_NAME = "preferred.network.address";

    private Hosts() {
        //Utility Class
    }

    /**
     * Returns a {@link Set} of {@link InetAddress} per {@link NetworkInterface} as a {@link Map}.
     */
    public static Map<String, Set<InetAddress>> getNetworkInterfaceAddresses(boolean includeLoopback) {
        //JVM returns interfaces in a non-predictable order, so to make this more predictable
        //let's have them sort by interface name (by using a TreeMap).
        Map<String, Set<InetAddress>> interfaceAddressMap = new TreeMap<>();
        try {
            Enumeration<NetworkInterface> ifaces = NetworkInterface.getNetworkInterfaces();
            while (ifaces.hasMoreElements()) {
                NetworkInterface iface = ifaces.nextElement();
                //We only care about usable interfaces.
                if (!iface.isUp()) {
                    continue;
                }
                if (!includeLoopback && iface.isLoopback()) {
                    continue;
                }
                String name = iface.getName();
                Enumeration<InetAddress> ifaceAdresses = iface.getInetAddresses();
                while (ifaceAdresses.hasMoreElements()) {
                    InetAddress ia = ifaceAdresses.nextElement();
                    if (!includeLoopback && ia.isLoopbackAddress()) {
                        continue;
                    }
                    // We want to filter out mac addresses
                    // Let's filter out docker interfaces too
                    if (!ia.getHostAddress().contains(":") && !(name != null && name.toLowerCase().contains("docker"))) {
                        Set<InetAddress> addresses = interfaceAddressMap.get(name);
                        if (addresses == null) {
                            addresses = new LinkedHashSet<>();
                        }
                        addresses.add(ia);
                        interfaceAddressMap.put(name, addresses);
                    }
                }
            }
        } catch (SocketException ex) {
            //noop
        }
        return interfaceAddressMap;
    }

    /**
     * Returns a {@link Set} of {@link InetAddress} that are non-loopback or mac.
     */
    public static Set<InetAddress> getAddresses() {
        Set<InetAddress> allAddresses = new LinkedHashSet<>();
        Map<String, Set<InetAddress>> interfaceAddressMap = getNetworkInterfaceAddresses(false);
        for (Map.Entry<String, Set<InetAddress>> entry : interfaceAddressMap.entrySet()) {
            Set<InetAddress> addresses = entry.getValue();
            if (!addresses.isEmpty()) {
                allAddresses.addAll(addresses);
            }
        }
        return allAddresses;
    }

    /**
     * Chooses one of the available {@link InetAddress} based on the specified preference.
     * If the preferred address is not part of the available addresses it will be ignored.
     */
    private static InetAddress chooseAddress(String preferred) throws UnknownHostException {
        Set<InetAddress> addresses = getAddresses();
        if (preferred != null && !preferred.isEmpty()) {
            //Favor preferred address if exists
            try {
                InetAddress preferredAddress = InetAddress.getByName(preferred);
                if (addresses.contains(preferredAddress)) {
                    LOG.info("preferred address is " + preferredAddress.getHostAddress() + " for host " + preferredAddress.getHostName());
                    return preferredAddress;
                }
            } catch (UnknownHostException e) {
                //noop
            }
            for (InetAddress address : addresses) {
                if (preferred.equals(address.getHostName())) {
                    return address;
                }
            }
            StringBuilder hostNameBuffer = new StringBuilder();
            for (InetAddress address : addresses) {
                if (hostNameBuffer.length() > 0) {
                    hostNameBuffer.append(", ");
                }
                hostNameBuffer.append(address.getHostName()).append("/").append(address.getHostAddress());
            }
            LOG.warn("Could not find network address for preferred '" + preferred + "' when the addresses were: " + hostNameBuffer);
        }
        if (addresses.contains(InetAddress.getLocalHost())) {
            //Then if local host address is not bound to a loop-back interface, use it.
            return InetAddress.getLocalHost();
        } else if (!addresses.isEmpty()) {
            //else return the first available addrress
            return addresses.toArray(new InetAddress[0])[0];
        } else {
            //else we are forcedt to use the localhost address.
            return InetAddress.getLocalHost();
        }
    }

    /**
     * Returns the local hostname. It loops through the network interfaces and returns the first non loopback address
     */
    public static String getLocalHostName() throws UnknownHostException {
        String preffered = System.getProperty(PREFERED_ADDRESS_PROPERTY_NAME);
        return chooseAddress(preffered).getHostName();
    }

    /**
     * Returns the local IP. It loops through the network interfaces and returns the first non loopback address
     */
    public static String getLocalIp() throws UnknownHostException {
        String preffered = System.getProperty(PREFERED_ADDRESS_PROPERTY_NAME);
        return chooseAddress(preffered).getHostAddress();
    }

}
