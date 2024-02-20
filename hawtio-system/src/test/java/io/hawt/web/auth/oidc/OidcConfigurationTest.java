/*
 * Copyright 2024 hawt.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web.auth.oidc;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.KeyFactory;
import java.security.KeyManagementException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.KeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.util.concurrent.TimeUnit;

import io.hawt.util.Strings;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.config.ConnectionConfig;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.config.SocketConfig;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.ssl.TrustStrategy;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class OidcConfigurationTest {

    public static final Logger LOG = LoggerFactory.getLogger(OidcConfigurationTest.class);

    @Test
    public void urls() throws MalformedURLException {
        String provider = "https://login.microsoftonline.com/00000000-1111-2222-3333-444444444444/v2.0/";
        URL providerURL = new URL(provider);
        URL wellKnown = new URL(providerURL, ".well-known/openid-configuration");
        assertEquals("https://login.microsoftonline.com/00000000-1111-2222-3333-444444444444/v2.0/.well-known/openid-configuration",
                wellKnown.toString());
    }

    @Test
    public void rsaKeys() throws Exception {
        // org.keycloak.jose.jwk.JWKParser.createRSAPublicKey
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        KeyPair pair = kpg.generateKeyPair();
        PublicKey publicKey1 = pair.getPublic();
        PrivateKey privateKey = pair.getPrivate();

        KeySpec publicKeySpec = new RSAPublicKeySpec(((RSAPublicKey) publicKey1).getModulus(), ((RSAPublicKey) publicKey1).getPublicExponent());
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PublicKey publicKey2 = kf.generatePublic(publicKeySpec);

        assertEquals(publicKey1, publicKey2);
    }

    @Test
    public void ecKeys() throws Exception {
        // org.keycloak.jose.jwk.JWKParser.createECPublicKey
        // we need BouncyCastle to create EC params. See
        //  - org.keycloak.common.crypto.CryptoProvider.createECParams
        //  - org.bouncycastle.jce.ECNamedCurveTable.getParameterSpec
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        KeyPair pair = kpg.generateKeyPair();
        KeyFactory kf = KeyFactory.getInstance("EC");
    }

    @Test
    @Disabled("Manual test")
    public void customSSLContextForPublicSite() throws IOException, NoSuchAlgorithmException, KeyManagementException, CertificateException, KeyStoreException {
        // can we create custom SSLContext for HttpClient4 with own trust material, but which
        // can connect to a site with known certificate ($JAVA_HOME/lib/security/cacerts)?

        RequestConfig.Builder requestConfigBuilder = RequestConfig.custom();
        // timeout in milliseconds used when requesting a connection from the connection manager
        requestConfigBuilder.setConnectionRequestTimeout(1);
        // java.net.Socket.setSoTimeout(), java.net.Socket.connect(..., timeout)
        requestConfigBuilder.setConnectTimeout(5000);
        // java.net.Socket.setSoTimeout()
        requestConfigBuilder.setSocketTimeout(10000);

        SocketConfig.Builder socketConfigBuilder = SocketConfig.custom();
        // java.net.Socket.setSoTimeout()
        socketConfigBuilder.setSoTimeout(10000);
        ConnectionConfig.Builder connectionConfigBuilder = ConnectionConfig.custom();

        SSLContextBuilder sslContextBuilder = SSLContexts.custom();
        System.setProperty("hawtio.truststore", "target/test-classes/hawtio.jks");

        // Loads default $JAVA_HOME/lib/security/cacerts
        sslContextBuilder.loadTrustMaterial((TrustStrategy) null);
        // Loads custom truststore - without default TMF, we wouldn't be able to connect to sites with certificates
        // provided by JDK itself
        sslContextBuilder.loadTrustMaterial(new File(Strings.resolvePlaceholders("${hawtio.truststore}")), "hawtio".toCharArray());
//        sslContextBuilder.loadKeyMaterial((File) null, null, null);

        SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContextBuilder.build(), new DefaultHostnameVerifier());

        Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.getSocketFactory())
                .register("https", csf)
                .build();

        PoolingHttpClientConnectionManager connectionManager
                = new PoolingHttpClientConnectionManager(registry, null, null, null, -1L, TimeUnit.MILLISECONDS);
        connectionManager.setDefaultConnectionConfig(connectionConfigBuilder.build());
        connectionManager.setDefaultSocketConfig(socketConfigBuilder.build());
        connectionManager.setMaxTotal(20);
        connectionManager.setDefaultMaxPerRoute(connectionManager.getMaxTotal());

        HttpClientBuilder builder = HttpClients.custom();
        builder.setDefaultCookieStore(new NopCookieStore());
        builder.useSystemProperties();
        builder.setSSLSocketFactory(csf);
        builder.setConnectionManager(connectionManager);
        builder.setDefaultRequestConfig(requestConfigBuilder.build());
//        builder.setProxy(null);

        try (CloseableHttpClient client = builder.build()) {
            HttpGet get = new HttpGet("https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration");
            CloseableHttpResponse res = client.execute(get);
            LOG.info("Result: {}", res.getStatusLine());
            LOG.info("Content-Type: {}", res.getFirstHeader("Content-Type"));
        }
    }

}
