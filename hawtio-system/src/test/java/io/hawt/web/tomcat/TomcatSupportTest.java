/*
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
package io.hawt.web.tomcat;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TomcatSupportTest {

    @Test
    public void matchingPasswordsNoDigest() {
        TomcatSupport ts = new TomcatSupport(null, "src/test/resources/tomcat-users-nodigest.xml");
        TomcatSupport.TomcatUser u1 = ts.attemptLogin("u1", "plain-text");
        assertNotNull(u1);
        assertEquals(4, u1.getRoles().size());
        assertTrue(u1.getRoles().contains("r2"));
        assertTrue(u1.getRoles().contains("rg1"));
        TomcatSupport.TomcatUser u2 = ts.attemptLogin("u2", "any");
        assertNull(u2);
    }

    @Test
    public void matchingPasswordsMD5Digest() {
        TomcatSupport ts = new TomcatSupport("MD5", "src/test/resources/tomcat-users-md5.xml");
        TomcatSupport.TomcatUser u1 = ts.attemptLogin("u1", "tomcat");
        assertNotNull(u1);
        TomcatSupport.TomcatUser u2 = ts.attemptLogin("u2", "tomcat");
        assertNotNull(u2);
        TomcatSupport.TomcatUser u3 = ts.attemptLogin("u3", "tomcat");
        assertNotNull(u3);
        TomcatSupport.TomcatUser u4 = ts.attemptLogin("u4", "tomcat");
        assertNotNull(u4);
        TomcatSupport.TomcatUser u5 = ts.attemptLogin("u5", "tomcat");
        assertNotNull(u5);
        TomcatSupport.TomcatUser u6 = ts.attemptLogin("u6", "tomcat");
        assertNotNull(u6);
    }

}
