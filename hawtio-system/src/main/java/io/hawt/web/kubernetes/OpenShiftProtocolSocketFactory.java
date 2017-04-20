package io.hawt.web.kubernetes;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

import org.apache.http.HttpHost;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A custom implementation which works on PaaS environments like OpenShift
 */
public class OpenShiftProtocolSocketFactory extends PlainConnectionSocketFactory {
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
    public Socket connectSocket(int i, Socket socket, HttpHost httpHost, InetSocketAddress inetSocketAddress, InetSocketAddress inetSocketAddress1, HttpContext httpContext) throws IOException {
        return super.connectSocket(i, socket, httpHost, inetSocketAddress, null /* local address */, httpContext);
    }
}
