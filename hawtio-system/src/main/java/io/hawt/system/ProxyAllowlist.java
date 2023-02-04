package io.hawt.system;

import java.lang.management.ManagementFactory;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.regex.Pattern;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;

import io.hawt.util.Hosts;
import io.hawt.util.Strings;
import io.hawt.web.proxy.ProxyDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Allowlist manager for hawtio proxy.
 * <p>
 * TODO: For now this implementation is heavily relying on Fabric v1, and should be rewritten to a more general form.
 */
public class ProxyAllowlist {

    private static final Logger LOG = LoggerFactory.getLogger(ProxyAllowlist.class);

    private static final String FABRIC_MBEAN = "io.fabric8:type=Fabric";

    protected CopyOnWriteArraySet<String> allowlist;
    protected List<Pattern> regexAllowlist;
    protected MBeanServer mBeanServer;
    protected ObjectName fabricMBean;

    public ProxyAllowlist(String allowlistStr) {
        this(allowlistStr, true);
    }

    public ProxyAllowlist(String allowlistStr, boolean probeLocal) {
        if (Strings.isBlank(allowlistStr)) {
            allowlist = new CopyOnWriteArraySet<>();
            regexAllowlist = Collections.emptyList();
        } else {
            allowlist = new CopyOnWriteArraySet<>(filterRegex(Strings.split(allowlistStr, ",")));
            regexAllowlist = buildRegexAllowlist(Strings.split(allowlistStr, ","));
        }

        if (probeLocal) {
            LOG.info("Probing local addresses ...");
            initialiseAllowlist();
        } else {
            LOG.info("Probing local addresses disabled");
            allowlist.add("localhost");
            allowlist.add("127.0.0.1");
        }
        LOG.info("Initial proxy allowlist: {}", allowlist);

        mBeanServer = ManagementFactory.getPlatformMBeanServer();
        try {
            fabricMBean = new ObjectName(FABRIC_MBEAN);
        } catch (MalformedObjectNameException e) {
            throw new RuntimeException(e);
        }
    }

    protected List<String> filterRegex(List<String> allowlist) {
        List<String> result = new ArrayList<>();

        for (String element : allowlist) {
            if (!element.startsWith("r:")) {
                result.add(element);
            }
        }

        return result;
    }

    protected List<Pattern> buildRegexAllowlist(List<String> allowlist) {
        List<Pattern> patterns = new ArrayList<>();

        for (String element : allowlist) {
            if (element.startsWith("r:")) {
                String regex = element.substring(2);
                patterns.add(Pattern.compile(regex));
            }
        }

        return patterns;
    }

    protected void initialiseAllowlist() {
        Map<String, Set<InetAddress>> localAddresses = Hosts.getNetworkInterfaceAddresses(true);
        for (Set<InetAddress> addresses : localAddresses.values()) {
            for (InetAddress address : addresses) {
                allowlist.add(address.getHostAddress());
                allowlist.add(address.getHostName());
                allowlist.add(address.getCanonicalHostName());
            }
        }
    }

    public boolean isAllowed(ProxyDetails details) {
        if (details.isAllowed(allowlist)) {
            return true;
        }

        // Update allowlist and check again
        LOG.debug("Updating proxy allowlist: {}, {}", allowlist, details);
        if (update() && details.isAllowed(allowlist)) {
            return true;
        }

        // test against the regex as last resort
        return details.isAllowed(regexAllowlist);
    }

    public boolean update() {
        if (!mBeanServer.isRegistered(fabricMBean)) {
            LOG.debug("Allowlist MBean not available");
            return false;
        }

        Set<String> newAllowlist = invokeMBean();
        int previousSize = allowlist.size();
        allowlist.addAll(newAllowlist);
        if (allowlist.size() == previousSize) {
            LOG.debug("No new proxy allowlist to update");
            return false;
        } else {
            LOG.info("Updated proxy allowlist: {}", allowlist);
            return true;
        }
    }

    protected Set<String> invokeMBean() {
        Set<String> list = new HashSet<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> containers = (List<Map<String, Object>>) mBeanServer.invoke(fabricMBean,
                "containers",
                new Object[] { Arrays.asList("localHostname", "localIp", "manualIp", "publicHostname", "publicIp") },
                new String[] { List.class.getName() });
            LOG.debug("Returned containers from MBean: {}", containers);
            for (Map<String, Object> container : containers) {
                for (Object value : container.values()) {
                    if (value != null && Strings.isNotBlank(value.toString())) {
                        list.add(value.toString());
                    }
                }
            }
            LOG.debug("Extracted allowlist: {}", list);
        } catch (InstanceNotFoundException | MBeanException | ReflectionException e) {
            LOG.error("Invocation to allowlist MBean failed: " + e.getMessage(), e);
        }
        return list;
    }
}
