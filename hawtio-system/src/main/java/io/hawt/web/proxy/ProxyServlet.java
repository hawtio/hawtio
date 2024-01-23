package io.hawt.web.proxy;

import java.io.IOException;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.BitSet;
import java.util.Enumeration;
import java.util.Formatter;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.system.ConfigManager;
import io.hawt.system.ProxyAllowlist;
import io.hawt.util.Strings;
import io.hawt.web.ForbiddenReason;
import io.hawt.web.ServletHelpers;
import org.apache.commons.codec.binary.Base64;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpEntityEnclosingRequest;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.CookieStore;
import org.apache.http.client.methods.AbortableHttpRequest;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.utils.URIUtils;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContextBuilder;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.apache.http.message.HeaderGroup;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An HTTP reverse proxy/gateway servlet. It is designed to be extended for customization
 * if desired. Most of the work is handled by
 * <a href="http://hc.apache.org/httpcomponents-client-ga/">Apache HttpClient</a>.
 * <p>
 * There are alternatives to a servlet based proxy such as Apache mod_proxy if that is available to you. However
 * this servlet is easily customizable by Java, secure-able by your web application's security (e.g. spring-security),
 * portable across servlet engines, and is embeddable into another web application.
 * </p>
 * <p>
 * Inspiration: http://httpd.apache.org/docs/2.0/mod/mod_proxy.html
 * </p>
 * <p>
 * Original implementation at https://github.com/mitre/HTTP-Proxy-Servlet, released under ASL 2.0.
 * </p>
 *
 * @author David Smiley dsmiley@mitre.org
 */
public class ProxyServlet extends HttpServlet {

    private static final long serialVersionUID = 7792226114533360114L;

    private static final Logger LOG = LoggerFactory.getLogger(ProxyServlet.class);

    /* INIT PARAMETER NAME CONSTANTS */

    /**
     * A boolean parameter name to enable forwarding of the client IP
     */
    public static final String P_FORWARDEDFOR = "forwardip";

    /**
     * Whether we accept self-signed SSL certificates
     */
    private static final String PROXY_ACCEPT_SELF_SIGNED_CERTS = "hawtio.proxyDisableCertificateValidation";
    private static final String PROXY_ACCEPT_SELF_SIGNED_CERTS_ENV = "PROXY_DISABLE_CERT_VALIDATION";

    public static final String PROXY_ALLOWLIST = "proxyAllowlist";
    public static final String LOCAL_ADDRESS_PROBING = "localAddressProbing";
    public static final String DISABLE_PROXY = "disableProxy";

    public static final String HAWTIO_PROXY_ALLOWLIST = "hawtio." + PROXY_ALLOWLIST;
    public static final String HAWTIO_LOCAL_ADDRESS_PROBING = "hawtio." + LOCAL_ADDRESS_PROBING;
    public static final String HAWTIO_DISABLE_PROXY = "hawtio." + DISABLE_PROXY;

    /* MISC */

    protected boolean enabled = true;

    protected boolean doForwardIP = true;
    protected boolean acceptSelfSignedCerts = false;

    protected ProxyAllowlist allowlist;

    protected CloseableHttpClient proxyClient;
    private CookieStore cookieStore;

    @Override
    public String getServletInfo() {
        return "A proxy servlet by David Smiley, dsmiley@mitre.org";
    }

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);

        ConfigManager config = (ConfigManager) getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);

        enabled = !config.getBoolean(DISABLE_PROXY, false);
        if (!enabled) {
            LOG.info("Proxy servlet is disabled");
            // proxy servlet is disabled so won't run any further initialisation
            return;
        }

        String allowlistStr = config.get(PROXY_ALLOWLIST).orElse(servletConfig.getInitParameter(PROXY_ALLOWLIST));
        boolean probeLocal = config.getBoolean(LOCAL_ADDRESS_PROBING, true);
        allowlist = new ProxyAllowlist(allowlistStr, probeLocal);

        String doForwardIPString = servletConfig.getInitParameter(P_FORWARDEDFOR);
        if (doForwardIPString != null) {
            this.doForwardIP = Boolean.parseBoolean(doForwardIPString);
        }

        cookieStore = new BasicCookieStore();
        HttpClientBuilder httpClientBuilder = HttpClients.custom()
            .setDefaultCookieStore(cookieStore)
            .useSystemProperties();

        if (System.getProperty(PROXY_ACCEPT_SELF_SIGNED_CERTS) != null) {
            acceptSelfSignedCerts = Boolean.parseBoolean(System.getProperty(PROXY_ACCEPT_SELF_SIGNED_CERTS));
        } else if (System.getenv(PROXY_ACCEPT_SELF_SIGNED_CERTS_ENV) != null) {
            acceptSelfSignedCerts = Boolean.parseBoolean(System.getenv(PROXY_ACCEPT_SELF_SIGNED_CERTS_ENV));
        }

        if (acceptSelfSignedCerts) {
            try {
                SSLContextBuilder builder = new SSLContextBuilder();
                builder.loadTrustMaterial(null, (X509Certificate[] x509Certificates, String s) -> true);
                SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
                    builder.build(), SSLConnectionSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
                httpClientBuilder.setSSLSocketFactory(sslsf);
            } catch (NoSuchAlgorithmException | KeyStoreException | KeyManagementException e) {
                throw new ServletException(e);
            }
        }

        proxyClient = httpClientBuilder.build();
    }

    @Override
    public void destroy() {
        try {
            if (proxyClient != null) {
                proxyClient.close();
            }
        } catch (IOException e) {
            log("While destroying servlet, shutting down httpclient: " + e, e);
            LOG.error("While destroying servlet, shutting down httpclient: " + e, e);
        }
        super.destroy();
    }

    @Override
    protected void service(HttpServletRequest servletRequest, HttpServletResponse servletResponse)
        throws IOException {
        // returns if enabled or not so that Connect plugin can turn on/off itself
        if ("/enabled".equals(servletRequest.getPathInfo())) {
            ServletHelpers.sendJSONResponse(servletResponse, enabled);
            return;
        }

        if (!enabled) {
            servletResponse.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // Make the Request
        //note: we won't transfer the protocol version because I'm not sure if it would truly be compatible
        ProxyAddress proxyAddress = parseProxyAddress(servletRequest);
        if (proxyAddress == null || proxyAddress.getFullProxyUrl() == null) {
            servletResponse.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        // TODO Implement allowlist protection for Kubernetes services as well
        if (proxyAddress instanceof ProxyDetails) {
            ProxyDetails details = (ProxyDetails) proxyAddress;
            if (!allowlist.isAllowed(details)) {
                LOG.debug("Rejecting {}", proxyAddress);
                ServletHelpers.doForbidden(servletResponse, ForbiddenReason.HOST_NOT_ALLOWED);
                return;
            }
        }

        String method = servletRequest.getMethod();
        String proxyRequestUri = proxyAddress.getFullProxyUrl();

        URI targetUriObj;
        try {
            targetUriObj = new URI(proxyRequestUri);
        } catch (URISyntaxException e) {
            LOG.error("URL '{}' is not valid: {}", proxyRequestUri, e.getMessage());
            servletResponse.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        HttpRequest proxyRequest;
        //spec: RFC 2616, sec 4.3: either of these two headers signal that there is a message body.
        if (servletRequest.getHeader(HttpHeaders.CONTENT_LENGTH) != null ||
            servletRequest.getHeader(HttpHeaders.TRANSFER_ENCODING) != null) {
            HttpEntityEnclosingRequest eProxyRequest = new BasicHttpEntityEnclosingRequest(method, proxyRequestUri);
            // Add the input entity (streamed)
            //  note: we don't bother ensuring we close the servletInputStream since the container handles it
            eProxyRequest.setEntity(new InputStreamEntity(servletRequest.getInputStream(), servletRequest.getContentLength()));
            proxyRequest = eProxyRequest;
        } else {
            proxyRequest = new BasicHttpRequest(method, proxyRequestUri);
        }

        copyRequestHeaders(servletRequest, proxyRequest, targetUriObj);

        String username = proxyAddress.getUserName();
        String password = proxyAddress.getPassword();

        if (Strings.isNotBlank(username) && Strings.isNotBlank(password)) {
            String encodedCreds = Base64.encodeBase64String((username + ":" + password).getBytes());
            proxyRequest.setHeader("Authorization", "Basic " + encodedCreds);
        }

        Header proxyAuthHeader = proxyRequest.getFirstHeader("Authorization");
        if (proxyAuthHeader != null) {
            String proxyAuth = proxyAuthHeader.getValue();
            // if remote jolokia credentials have changed, we have to clear session cookies in http-client
            HttpSession session = servletRequest.getSession();
            if (session != null) {
                String previousProxyCredentials = (String) session.getAttribute("proxy-credentials");
                if (previousProxyCredentials != null && !previousProxyCredentials.equals(proxyAuth)) {
                    cookieStore.clear();
                }
                session.setAttribute("proxy-credentials", proxyAuth);
            }
        }

        setXForwardedForHeader(servletRequest, proxyRequest);

        CloseableHttpResponse proxyResponse = null;
        int statusCode = 0;
        try {

            // Execute the request
            LOG.debug("proxy {} uri: {} -- {}", method, servletRequest.getRequestURI(), proxyRequest.getRequestLine().getUri());
            proxyResponse = proxyClient.execute(URIUtils.extractHost(targetUriObj), proxyRequest);

            // Process the response
            statusCode = proxyResponse.getStatusLine().getStatusCode();

            if (statusCode == 401 || statusCode == 403) {
                LOG.debug("Authentication Failed on remote server {}", proxyRequestUri);
            } else if (doResponseRedirectOrNotModifiedLogic(servletRequest, servletResponse, proxyResponse, statusCode, targetUriObj)) {
                //the response is already "committed" now without any body to send
                //TODO copy response headers?
                return;
            }

            // Pass the response code. This method with the "reason phrase" is deprecated, but it's the only way to pass the
            //  reason along too.
            //noinspection deprecation
            servletResponse.setStatus(statusCode);
            copyResponseHeaders(proxyResponse, servletResponse);

            // Send the content to the client
            copyResponseEntity(proxyResponse, servletResponse);

        } catch (Exception e) {
            //abort request, according to best practice with HttpClient
            if (proxyRequest instanceof AbortableHttpRequest) {
                AbortableHttpRequest abortableHttpRequest = (AbortableHttpRequest) proxyRequest;
                abortableHttpRequest.abort();
            }
            // Exception needs to be suppressed for security reason
            LOG.debug("Proxy to " + proxyRequestUri + " failed", e);
            if (e instanceof ConnectException || e instanceof UnknownHostException) {
                // Target host refused connection or doesn't exist
                servletResponse.setStatus(HttpServletResponse.SC_NOT_FOUND);
            } else if (e instanceof ServletException) {
                // Redirect / Not Modified failed
                servletResponse.sendError(HttpServletResponse.SC_BAD_GATEWAY, e.getMessage());
            } else if (e instanceof SecurityException) {
                servletResponse.setHeader("WWW-Authenticate", "Basic");
                servletResponse.sendError(statusCode, e.getMessage());
            } else {
                servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
            }

        } finally {
            if (proxyResponse != null) {
                // Make sure the entire entity was consumed
                EntityUtils.consumeQuietly(proxyResponse.getEntity());

                try {
                    proxyResponse.close();
                } catch (IOException e) {
                    LOG.error("Error closing proxy client response: {}", e.getMessage());
                }
            }
            //Note: Don't need to close servlet outputStream:
            // http://stackoverflow.com/questions/1159168/should-one-call-close-on-httpservletresponse-getoutputstream-getwriter
        }
    }

    protected ProxyAddress parseProxyAddress(HttpServletRequest servletRequest) {
        return new ProxyDetails(servletRequest);
    }

    protected boolean doResponseRedirectOrNotModifiedLogic(
        HttpServletRequest servletRequest, HttpServletResponse servletResponse,
        HttpResponse proxyResponse, int statusCode, URI targetUriObj)
        throws ServletException, IOException {
        // Check if the proxy response is a redirect
        // The following code is adapted from org.tigris.noodle.filters.CheckForRedirect
        if (statusCode >= HttpServletResponse.SC_MULTIPLE_CHOICES /* 300 */
            && statusCode < HttpServletResponse.SC_NOT_MODIFIED /* 304 */) {
            Header locationHeader = proxyResponse.getLastHeader(HttpHeaders.LOCATION);
            if (locationHeader == null) {
                throw new ServletException("Received status code: " + statusCode
                    + " but no " + HttpHeaders.LOCATION + " header was found in the response");
            }

            String locStr = rewriteUrlFromResponse(servletRequest,locationHeader.getValue(), Strings.sanitize(targetUriObj.toString());
            servletResponse.sendRedirect(locStr);
            return true;
        }
        // 304 needs special handling.  See:
        // http://www.ics.uci.edu/pub/ietf/http/rfc1945.html#Code304
        // We get a 304 whenever passed an 'If-Modified-Since'
        // header and the data on disk has not changed; server
        // responds w/ a 304 saying I'm not going to send the
        // body because the file has not changed.
        if (statusCode == HttpServletResponse.SC_NOT_MODIFIED) {
            servletResponse.setIntHeader(HttpHeaders.CONTENT_LENGTH, 0);
            servletResponse.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            return true;
        }
        return false;
    }

    /**
     * These are the "hop-by-hop" headers that should not be copied.
     * http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html
     * I use an HttpClient HeaderGroup class instead of Set<String> because this
     * approach does case-insensitive lookup faster.
     */
    protected static final HeaderGroup hopByHopHeaders;

    static {
        hopByHopHeaders = new HeaderGroup();
        String[] headers = new String[]{
            "Connection", "Keep-Alive", "Proxy-Authenticate", "Proxy-Authorization",
            "TE", "Trailers", "Transfer-Encoding", "Upgrade", "Cookie", "Set-Cookie"};
        for (String header : headers) {
            hopByHopHeaders.addHeader(new BasicHeader(header, null));
        }
    }

    /**
     * Copy request headers from the servlet client to the proxy request.
     */
    protected void copyRequestHeaders(HttpServletRequest servletRequest, HttpRequest proxyRequest, URI targetUriObj) {
        // Get an Enumeration of all the header names sent by the client
        Enumeration<String> enumerationOfHeaderNames = servletRequest.getHeaderNames();
        while (enumerationOfHeaderNames.hasMoreElements()) {
            String headerName = enumerationOfHeaderNames.nextElement();
            //Instead the content-length is effectively set via InputStreamEntity
            if (headerName.equalsIgnoreCase(HttpHeaders.CONTENT_LENGTH))
                continue;
            if (hopByHopHeaders.containsHeader(headerName))
                continue;

            Enumeration<String> headers = servletRequest.getHeaders(headerName);
            while (headers.hasMoreElements()) {//sometimes more than one value
                String headerValue = headers.nextElement();
                // In case the proxy host is running multiple virtual servers,
                // rewrite the Host header to ensure that we get content from
                // the correct virtual server
                if (headerName.equalsIgnoreCase(HttpHeaders.HOST)) {
                    HttpHost host = URIUtils.extractHost(targetUriObj);
                    if (host != null) {
                        headerValue = host.getHostName();
                        if (headerValue != null && host.getPort() != -1) {
                            headerValue += ":" + host.getPort();
                        }
                    }
                }
                proxyRequest.addHeader(headerName, Strings.sanitizeHeader(headerValue));
            }
        }
    }

    private void setXForwardedForHeader(HttpServletRequest servletRequest,
                                        HttpRequest proxyRequest) {
        String headerName = "X-Forwarded-For";
        if (doForwardIP) {
            String newHeader = servletRequest.getRemoteAddr();
            String existingHeader = servletRequest.getHeader(headerName);
            if (existingHeader != null) {
                newHeader = existingHeader + ", " + newHeader;
            }
            proxyRequest.setHeader(headerName, Strings.sanitizeHeader(newHeader));
        }
    }

    /**
     * Copy proxied response headers back to the servlet client.
     */
    protected void copyResponseHeaders(HttpResponse proxyResponse, HttpServletResponse servletResponse) {
        for (Header header : proxyResponse.getAllHeaders()) {
            if (hopByHopHeaders.containsHeader(header.getName()))
                continue;
            servletResponse.addHeader(header.getName(), header.getValue());
        }
    }

    /**
     * Copy response body data (the entity) from the proxy to the servlet client.
     */
    protected void copyResponseEntity(HttpResponse proxyResponse, HttpServletResponse servletResponse) throws IOException {
        HttpEntity entity = proxyResponse.getEntity();
        if (entity != null) {
            OutputStream servletOutputStream = servletResponse.getOutputStream();
            entity.writeTo(servletOutputStream);
        }
    }

    /**
     * For a redirect response from the target server, this translates {@code theUrl} to redirect to
     * and translates it to one the original client can use.
     */
    protected String rewriteUrlFromResponse(HttpServletRequest servletRequest, String theUrl, String targetUri) {
        //TODO document example paths
        if (theUrl.startsWith(targetUri)) {
            String curUrl = servletRequest.getRequestURL().toString();//no query
            String pathInfo = servletRequest.getPathInfo();
            if (pathInfo != null) {
                assert curUrl.endsWith(pathInfo);
                curUrl = curUrl.substring(0, curUrl.length() - pathInfo.length());//take pathInfo off
            }
            theUrl = curUrl + theUrl.substring(targetUri.length());
        }
        return theUrl;
    }

    /**
     * Encodes characters in the query or fragment part of the URI.
     * <p/>
     * <p>Unfortunately, an incoming URI sometimes has characters disallowed by the spec.  HttpClient
     * insists that the outgoing proxied request has a valid URI because it uses Java's {@link URI}.
     * To be more forgiving, we must escape the problematic characters.  See the URI class for the
     * spec.
     *
     * @param in example: name=value&foo=bar#fragment
     */
    protected static CharSequence encodeUriQuery(CharSequence in) {
        //Note that I can't simply use URI.java to encode because it will escape pre-existing escaped things.
        StringBuilder outBuf = null;
        Formatter formatter = null;
        for (int i = 0; i < in.length(); i++) {
            char c = in.charAt(i);
            boolean escape = true;
            if (c < 128) {
                if (asciiQueryChars.get(c)) {
                    escape = false;
                }
            } else if (!Character.isISOControl(c) && !Character.isSpaceChar(c)) {//not-ascii
                escape = false;
            }
            if (!escape) {
                if (outBuf != null)
                    outBuf.append(c);
            } else {
                //escape
                if (outBuf == null) {
                    outBuf = new StringBuilder(in.length() + 5 * 3);
                    outBuf.append(in, 0, i);
                    formatter = new Formatter(outBuf);
                }
                //leading %, 0 padded, width 2, capital hex
                formatter.format("%%%02X", (int) c);//TODO
            }
        }
        return outBuf != null ? outBuf : in;
    }

    protected static final BitSet asciiQueryChars;

    static {
        char[] c_unreserved = "_-!.~'()*".toCharArray();//plus alphanum
        char[] c_punct = ",;:$&+=".toCharArray();
        char[] c_reserved = "?/[]@".toCharArray();//plus punct

        asciiQueryChars = new BitSet(128);
        for (char c = 'a'; c <= 'z'; c++) asciiQueryChars.set(c);
        for (char c = 'A'; c <= 'Z'; c++) asciiQueryChars.set(c);
        for (char c = '0'; c <= '9'; c++) asciiQueryChars.set(c);
        for (char c : c_unreserved) asciiQueryChars.set(c);
        for (char c : c_punct) asciiQueryChars.set(c);
        for (char c : c_reserved) asciiQueryChars.set(c);

        asciiQueryChars.set('%');//leave existing percent escapes in place
    }

}
