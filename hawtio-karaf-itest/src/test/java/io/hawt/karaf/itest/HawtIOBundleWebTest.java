/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.karaf.itest;

import java.util.concurrent.TimeUnit;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.ops4j.pax.exam.CoreOptions;
import org.ops4j.pax.exam.Option;
import org.ops4j.pax.exam.junit.Configuration;
import org.ops4j.pax.exam.junit.JUnit4TestRunner;

import static org.junit.Assert.assertEquals;

@RunWith(JUnit4TestRunner.class)
public class HawtIOBundleWebTest extends AbstractFeatureTest {

    static final String WEB_CONSOLE_URL = "http://localhost:8181/hawtio/";

    @Configuration
    public static Option[] configure() {
        return append(CoreOptions.mavenBundle("commons-codec", "commons-codec").versionAsInProject(),
                append(CoreOptions.mavenBundle("commons-httpclient", "commons-httpclient").versionAsInProject(),
                        AbstractFeatureTest.configure()));
    }

    @Test
    public void testWeb() throws Exception {
        HttpClient client = new HttpClient();

        System.err.println("attempting publish via web console..");

        // get the osgi tab
        GetMethod get = new GetMethod(WEB_CONSOLE_URL + "/index.html");

        // Give console some time to start
        for (int i=0; i<20; i++) {
            TimeUnit.SECONDS.sleep(1);
            try {
                i = client.executeMethod(get);
            } catch (java.net.ConnectException ignored) {}
        }
        assertEquals("get succeeded on " + get, 200, get.getStatusCode());
    }
}
