/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
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
package io.hawt.web;

import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.Test;
import org.apache.commons.codec.binary.Base64;

import java.util.Arrays;

/**
 */
public class JBossPostApp {
    String host = "localhost";
    int port = 9990;
    String url = "http://" + host + ":" + port + "/management";
    String data = "{\"operation\":\"read-attribute\",\"address\":[],\"name\":\"release-version\",\"json.pretty\":1}";

    String userName = System.getProperty("user", "admin");
    String password = System.getProperty("password", "welcome123");


    @Test
    public void testPostWithCredentials() throws Exception {
        System.out.println("Using URL: " + url + " user: " + userName + " password: " + password);

        CredentialsProvider credsProvider = new BasicCredentialsProvider();
        credsProvider.setCredentials(
                new AuthScope(host, port, AuthScope.ANY_REALM),
                new UsernamePasswordCredentials("user", "passwd"));
        CloseableHttpClient client = HttpClients.custom()
                .setDefaultCredentialsProvider(credsProvider)
                .build();

        HttpPost method = new HttpPost(url);

        method.setEntity(new StringEntity(data, ContentType.APPLICATION_JSON));

        CloseableHttpResponse result = client.execute(method);

        System.out.println("Status: " + result.getStatusLine().getStatusCode());

        String response = EntityUtils.toString(result.getEntity());
        System.out.println(response);
        client.close();
    }

    @Test
    public void testPostWithAuthorizationHeader() throws Exception {
        System.out.println("Using URL: " + url + " user: " + userName + " password: " + password);

        CloseableHttpClient client = HttpClients.createDefault();
        HttpPost method = new HttpPost(url);

        String userPwd = userName + ":" + password;
        String hash = new Base64().encodeAsString(userPwd.getBytes());
        method.setHeader("Authorization", "Basic " + hash);
        System.out.println("headers " + Arrays.asList(method.getAllHeaders()));
        method.setEntity(new StringEntity(data, ContentType.APPLICATION_JSON));

        CloseableHttpResponse result = client.execute(method);
        System.out.println("Status: " + result);

        String response = EntityUtils.toString(result.getEntity());
        System.out.println(response);
        client.close();
    }

}
