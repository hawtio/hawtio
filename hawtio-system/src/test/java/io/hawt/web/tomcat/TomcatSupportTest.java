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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

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

    @Test
    public void fixTomcatIssue() throws Exception {
        // see https://bz.apache.org/bugzilla/show_bug.cgi?id=69852
        // for SSHA, when verifying password, first the credentials are digested then the salt
        // but salt$ic$digest format is verified by org.apache.catalina.realm.MessageDigestCredentialHandler.mutate
        // which first digests the salt and then the credentials
        // so we can't even create a password for SSHA using:
        // $ bin/digest.sh -a SHA-1 -i 1 -s <salt-size> <password>
        // because this would digest salt first...

        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        byte[] salt = new byte[38];
        SecureRandom.getInstance("SHA1PRNG").nextBytes(salt);

        sha1.update("tomcat".getBytes(StandardCharsets.UTF_8));
        sha1.update(salt);

        byte[] digest = sha1.digest();
        byte[] digestAndSalt = new byte[58];
        System.arraycopy(digest, 0, digestAndSalt, 0, 20);
        System.arraycopy(salt, 0, digestAndSalt, 20, 38);
        String base64 = Base64.getEncoder().encodeToString(digestAndSalt);

        File f = File.createTempFile("tomcat-users-", ".xml");
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(f))) {
            bw.write("<tomcat-users xmlns=\"http://tomcat.apache.org/xml\">\n");
            bw.write(String.format("  <user username=\"tomcat\" password=\"{SSHA}%s\" roles=\"admin\"/>\n", base64));
            bw.write("</tomcat-users>\n");
        }

        // MD5 should be ignored
        TomcatSupport ts = new TomcatSupport("MD5", f.getAbsolutePath());
        TomcatSupport.TomcatUser u1 = ts.attemptLogin("tomcat", "tomcat");
        assertNotNull(u1);
        assertEquals(1, u1.getRoles().size());
        assertTrue(u1.getRoles().contains("admin"));
    }

}
