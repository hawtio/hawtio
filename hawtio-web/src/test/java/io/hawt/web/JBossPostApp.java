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

import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.junit.Test;
import org.ops4j.net.Base64Encoder;

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

        HttpClient client = new HttpClient();
        PostMethod method = new PostMethod(url);

        //client.getParams().setAuthenticationPreemptive(true);
        method.setDoAuthentication(true);

        Credentials defaultcreds = new UsernamePasswordCredentials(userName, password);
        client.getState().setCredentials(new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);
        //client.getState().setProxyCredentials(new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);

        method.setRequestEntity(new StringRequestEntity(data, "application/json", "UTF-8"));

        int result = client.executeMethod(method);

        System.out.println("Status: " + result);

        String response = method.getResponseBodyAsString();
        System.out.println(response);
    }

    @Test
    public void testPostWithAuthorizationHeader() throws Exception {
        System.out.println("Using URL: " + url + " user: " + userName + " password: " + password);

        HttpClient client = new HttpClient();
        PostMethod method = new PostMethod(url);

        String userPwd = userName + ":" + password;
        String hash = Base64Encoder.encode(userPwd);
        //String hash = Base64.encode(userPwd.getBytes());
        method.setRequestHeader("Authorization", "Basic " + hash);
        System.out.println("headers " + Arrays.asList(method.getRequestHeaders()));
        method.setRequestEntity(new StringRequestEntity(data, "application/json", "UTF-8"));

        int result = client.executeMethod(method);

        System.out.println("Status: " + result);

        String response = method.getResponseBodyAsString();
        System.out.println(response);
    }

}
