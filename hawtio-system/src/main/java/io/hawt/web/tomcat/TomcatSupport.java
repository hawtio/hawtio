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

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.security.auth.Subject;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.spi.LoginModule;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 * A class to be instantiated once and passed to {@link TomcatUsersLoginModule}. But it still can be
 * instantiated by the login module itself on each login, when it's not provided with programmatically
 * passed options. (So the login module can still be declared and configured with
 * {@code -Djava.security.auth.login.config}).
 */
public class TomcatSupport {

    @SuppressWarnings("LoggerInitializedWithForeignClass")
    public static final Logger LOG = LoggerFactory.getLogger(TomcatUsersLoginModule.class);

    private String digestAlgorithm;
    private boolean noDigest = false;

    private File file;
    private long ts = -1L;

    private final Map<String, TomcatUser> users = new HashMap<>();

    /**
     * Create {@link TomcatSupport} object passing a {@link java.security.MessageDigest} algorithm and a location
     * (could be empty, so default is used) of {@code conf/tomcat-users.xml}.
     *
     * @param digestAlgorithm
     * @param tomcatUserLocation
     */
    public TomcatSupport(String digestAlgorithm, String tomcatUserLocation) {
        init(digestAlgorithm, tomcatUserLocation);
    }

    /**
     * Create {@link TomcatSupport} using untyped set of options passed through
     * {@link LoginModule#initialize(Subject, CallbackHandler, Map, Map)}.
     *
     * @param options
     */
    public TomcatSupport(Map<String,?> options) {
        Object digestAlgorithm = options.get(TomcatUsersLoginModule.OPTION_DIGEST_ALGORITHM);
        String digest;
        if (digestAlgorithm != null && !(digestAlgorithm instanceof String)) {
            throw new IllegalArgumentException("Invalid digest algorithm for password encoder: " + digestAlgorithm);
        }
        digest = digestAlgorithm == null ? "NONE" : (String) digestAlgorithm;

        Object usersLocation = options.get(TomcatUsersLoginModule.OPTION_TOMCAT_USER_LOCATION);
        String location;
        if (usersLocation != null && !(usersLocation instanceof String)) {
            throw new IllegalArgumentException("Invalid Tomcat users file location: " + usersLocation);
        }
        location = (String) usersLocation;
        init(digest, location);
    }

    private void init(String digestAlgorithm, String tomcatUserLocation) {
        // checking digest
        if (!(digestAlgorithm == null || "NONE".equalsIgnoreCase(digestAlgorithm))) {
            try {
                MessageDigest.getInstance(digestAlgorithm);
                this.digestAlgorithm = digestAlgorithm;
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalArgumentException("Unsupported message digest algorithm: " + digestAlgorithm);
            }
        } else {
            noDigest = true;
        }

        // checking file location
        File location = null;
        if (tomcatUserLocation != null) {
            location = Paths.get(tomcatUserLocation).toFile();
            if (!location.isFile()) {
                throw new IllegalArgumentException("Tomcat user database file location is not readable: " + tomcatUserLocation);
            }
        } else {
            // locate known location
            List<String> checks = List.of(
                    System.getProperty("catalina.base", "."),
                    System.getProperty("catalina.home", ".")
            );
            for (String loc : checks) {
                File f = Paths.get(loc, "conf", "tomcat-users.xml").toFile();
                if (f.isFile()) {
                    location = f;
                    break;
                }
            }
        }
        if (location == null) {
            // we can't find any proper location
            throw new IllegalArgumentException("Can't locate Tomcat user database file in the standard locations");
        }
        file = location;

        reloadUsersIfNeeded();
    }

    @SuppressWarnings("HttpUrlsUsage")
    synchronized private void reloadUsersIfNeeded() {
        if (ts < file.lastModified()) {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            // XML paranoia
            setFeature(dbf, "http://apache.org/xml/features/disallow-doctype-decl", true);
            setFeature(dbf, "http://xml.org/sax/features/external-general-entities", false);
            setFeature(dbf, "http://xml.org/sax/features/external-parameter-entities", false);
            setFeature(dbf, "http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            setFeature(dbf, XMLConstants.FEATURE_SECURE_PROCESSING, true);
            dbf.setNamespaceAware(true);
            dbf.setXIncludeAware(false);
            dbf.setExpandEntityReferences(false);

            try {
                DocumentBuilder builder = dbf.newDocumentBuilder();
                Document dom = builder.parse(file);
                ts = file.lastModified();
                this.users.clear();

                Map<String, List<String>> groupRoles = new HashMap<>();
                NodeList groups = dom.getElementsByTagNameNS("http://tomcat.apache.org/xml", "group");
                for (int i = 0; i < groups.getLength(); i++) {
                    Node node = groups.item(i);
                    // <group groupname="g1" description="string" roles="rg1, rg2" />
                    Node groupItem = node.getAttributes().getNamedItem("groupname");
                    Node rolesItem = node.getAttributes().getNamedItem("roles");
                    if (groupItem != null) {
                        String nGroup = groupItem.getNodeValue();
                        String nRoles = rolesItem == null ? "" : rolesItem.getNodeValue();
                        groupRoles.put(nGroup, Arrays.asList(nRoles.split("\\s*,\\s*")));
                    }
                }
                NodeList users = dom.getElementsByTagNameNS("http://tomcat.apache.org/xml", "user");
                for (int i = 0; i < users.getLength(); i++) {
                    Node node = users.item(i);
                    // <user username="u1" password="plain-text" roles="r1,r2" groups="g1" />
                    // attributeFormDefault="unqualified", so getNamedItem instead of getNamedItemNS
                    Node userItem = node.getAttributes().getNamedItem("username");
                    Node passwordItem = node.getAttributes().getNamedItem("password");
                    Node rolesItem = node.getAttributes().getNamedItem("roles");
                    Node groupsItem = node.getAttributes().getNamedItem("groups");
                    if (userItem == null || passwordItem == null) {
                        continue;
                    }
                    String nUsername = userItem.getNodeValue();
                    String nPassword = passwordItem.getNodeValue();
                    String nRoles = rolesItem == null ? "" : rolesItem.getNodeValue();
                    String nGroups = groupsItem == null ? "" : groupsItem.getNodeValue();
                    Set<String> mergedRoles = new HashSet<>(Arrays.asList(nRoles.split("\\s*,\\s*")));
                    Arrays.asList(nGroups.split("\\s*,\\s*")).forEach(g -> {
                        if (groupRoles.containsKey(g)) {
                            mergedRoles.addAll(groupRoles.get(g));
                        }
                    });
                    this.users.put(nUsername, new TomcatUser(nUsername, nPassword, mergedRoles));
                }
            } catch (ParserConfigurationException | IOException | SAXException e) {
                LOG.warn("Can't parse XML with Tomcat user database: {}", e.getMessage(), e);
            }
        }
    }

    private void setFeature(DocumentBuilderFactory dbf, String featureUrl, boolean value) {
        try {
            dbf.setFeature(featureUrl, value);
        } catch (ParserConfigurationException e) {
            throw new RuntimeException(e);
        }
    }

    public TomcatUser attemptLogin(String username, String password) {
        reloadUsersIfNeeded();
        TomcatUser user = users.get(username);
        if (user == null) {
            LOG.trace("Login denied due user not found");
            return null;
        }

        boolean passwordMatch = user.checkPassword(password);
        if (!passwordMatch) {
            LOG.trace("Login denied due password did not match");
            return null;
        }

        return user;
    }

    public class TomcatUser {
        @SuppressWarnings("FieldCanBeLocal")
        private final String username;
        private char[] password;
        private final Set<String> roles;

        private String specialDigest = null;

        int ic;
        byte[] salt;

        public TomcatUser(String username, String password, Set<String> roles) {
            this.username = username;
            this.roles = roles;

            // https://tomcat.apache.org/tomcat-11.0-doc/config/credentialhandler.html#MessageDigestCredentialHandler
            //  - plainText - the plain text credentials if no algorithm is specified
            //  - encodedCredential - a hex encoded digest of the password digested using the configured digest
            //  - {MD5}encodedCredential - a Base64 encoded MD5 digest of the password
            //  - {SHA}encodedCredential - a Base64 encoded SHA1 digest of the password
            //  - {SSHA}encodedCredential - 20 character salt followed by the salted SHA1 digest Base64 encoded - wrong description
            //  - salt$iterationCount$encodedCredential - a hex encoded salt, iteration code and a hex encoded credential, each separated by $

            if (password == null) {
                this.password = new char[0];
                return;
            }
            if (password.startsWith("{")) {
                ic = 1;
                salt = new byte[0];
                if (password.startsWith("{MD5}")) {
                    specialDigest = "MD5";
                    byte[] binPassword = Base64.getDecoder().decode(password.substring(5));
                    this.password = HexFormat.of().withLowerCase().formatHex(binPassword).toCharArray();
                } else if (password.startsWith("{SHA}")) {
                    specialDigest = "SHA-1";
                    byte[] binPassword = Base64.getDecoder().decode(password.substring(5));
                    this.password = HexFormat.of().withLowerCase().formatHex(binPassword).toCharArray();
                } else if (password.startsWith("{SSHA}")) {
                    specialDigest = "SHA-1";
                    byte[] digestAndSalt = Base64.getDecoder().decode(password.substring(6));
                    if (digestAndSalt.length < 20) {
                        throw new IllegalArgumentException("{SSHA} prefixed password should contain 20 bytes of salt value");
                    }
                    byte[] digestedPassword = new byte[20]; // SHA-1 digest is 160 bits
                    salt = new byte[digestAndSalt.length - 20];
                    System.arraycopy(digestAndSalt, 0, digestedPassword, 0, 20);
                    System.arraycopy(digestAndSalt, 20, salt, 0, digestAndSalt.length - 20);
                    this.password = HexFormat.of().withLowerCase().formatHex(digestedPassword).toCharArray();
                } else {
                    throw new IllegalArgumentException("Wrong password format, unknown prefix for encoded password for user: \"" + username + "\"");
                }
            } else if (password.contains("$")) {
                String[] split = password.split("\\$");
                if (split.length == 1) {
                    // no IC, no salt
                    ic = 1;
                    salt = new byte[0];
                    this.password = split[0].toCharArray();
                } else if (split.length == 3) {
                    if (noDigest) {
                        throw new IllegalArgumentException("No digest algorithm was specified, but the password uses salt and iteraction count parameters");
                    }
                    // see:
                    // $ bin/digest.sh -a SHA1 asd
                    // asd:1787540155b87da66d7883f98f2aad3f95a38cf5ccd65f99be5e9abd0014e630$1$6d54f2cc2f8ccac94d86d75990ec525d41893b80
                    //
                    // $ bin/digest.sh -a SHA1 -s 0 asd
                    // asd:f10e2821bbbea527ea02200352313bc059445190
                    //
                    // $ bin/digest.sh -a SHA1 -s 4 asd
                    // asd:62031d7f$1$a80ebd476857c8b38071d11a8d76b87398ca074f
                    //
                    // $ bin/digest.sh -a SHA1 -s 4 -i 10 asd
                    // asd:1996a1b0$10$623a6de30a7fdf665405bb28afbf552a43b7370a
                    try {
                        ic = Integer.parseInt(split[1], 10);
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Wrong specification of iteration count: \"" + split[1] + "\"");
                    }
                    salt = HexFormat.of().withLowerCase().parseHex(split[0].toLowerCase());
                    this.password = split[2].toLowerCase().toCharArray();
                }
            } else if (digestAlgorithm != null) {
                // try hex decoding
                try {
                    byte[] binPassword = HexFormat.of().withLowerCase().parseHex(password.toLowerCase());
                    this.password = HexFormat.of().withLowerCase().formatHex(binPassword).toCharArray();
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Wrong password format for user \"" + username + "\": when using digest " + digestAlgorithm
                            + " - password should be properly HEX-encoded", e);
                }
            } else {
                // plain text
                this.password = password.toCharArray();
            }
        }

        public boolean checkPassword(String password) {
            if (noDigest) {
                return Arrays.equals(this.password, password.toCharArray());
            } else {
                try {
                    MessageDigest md = MessageDigest.getInstance(specialDigest == null ? digestAlgorithm : specialDigest);

                    byte[] digest;
                    if (specialDigest == null) {
                        // see org.apache.tomcat.util.security.ConcurrentMessageDigest.digest(java.lang.String, int, byte[]...)
                        // for iteration count and salt.
                        if (salt != null && salt.length > 0) {
                            md.update(salt);
                        }
                        md.update(password.getBytes(StandardCharsets.UTF_8));
                        digest = md.digest();
                    } else {
                        // for {SSHA} we first digest the password then the salt
                        // for {SHA} and {MD5} there's no salt
                        md.update(password.getBytes(StandardCharsets.UTF_8));
                        if (salt != null && salt.length > 0) {
                            md.update(salt);
                        }
                        digest = md.digest();
                    }

                    for (int i = 1; i < ic; i++) {
                        md.update(digest);
                        digest = md.digest(); // digest() resets automatically
                    }
                    return Arrays.equals(this.password, HexFormat.of().withLowerCase().formatHex(digest).toCharArray());
                } catch (NoSuchAlgorithmException e) {
                    // should not happen - we've checked it during initialization
                    throw new IllegalStateException("Unsupported message digest algorithm: " + e.getMessage(), e);
                }
            }
        }

        public String getUsername() {
            return username;
        }

        public Set<String> getRoles() {
            return roles;
        }
    }

}
