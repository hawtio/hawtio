package io.hawt.web;

import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;

import org.apache.commons.httpclient.protocol.DefaultProtocolSocketFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A custom implementation which works on PaaS environments like OpenShift
 */
public class OpenShiftProtocolSocketFactory extends DefaultProtocolSocketFactory {
    private static final transient Logger LOG = LoggerFactory.getLogger(OpenShiftProtocolSocketFactory.class);

    /**
     * The factory singleton.
     */
    private static final OpenShiftProtocolSocketFactory factory = new OpenShiftProtocolSocketFactory();

    /**
     * Gets an singleton instance of the OpenShiftProtocolSocketFactory.
     *
     * @return a OpenShiftProtocolSocketFactory
     */
    public static OpenShiftProtocolSocketFactory getSocketFactory() {
        return factory;
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localAddress, int localPort) throws IOException {
        if (LOG.isDebugEnabled()) {
            LOG.debug("Creating OpenShift socket on " + host + ":" + port);
        }
        return new Socket(host, port);
    }

}
