/**
 *  Copyright 2005-2014 Red Hat, Inc.
 *
 *  Red Hat licenses this file to you under the Apache License, version
 *  2.0 (the "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *  implied.  See the License for the specific language governing
 *  permissions and limitations under the License.
 */
package io.hawt.kubernetes;

import io.hawt.git.GitFacade;
import io.hawt.util.Files;
import io.hawt.util.Function;
import io.hawt.util.IOHelper;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.regex.Pattern;

import static io.hawt.util.Strings.isBlank;

/**
 * Helper MBean to expose the <a href="http://kubernetes.io/">Kubernetes</a> REST API
 */
public class KubernetesService extends MBeanSupport implements KubernetesServiceMXBean {

    public static final String DEFAULT_DOCKER_HOST = "tcp://localhost:2375";
    private static final transient Logger LOG = LoggerFactory.getLogger(KubernetesService.class);
    private GitFacade git;

    public void init() throws Exception {
        String url = getKubernetesAddress();
        if (Strings.isNotBlank(url)) {
            super.init();
        }
    }

    @Override
    public void destroy() throws Exception {
        super.destroy();
    }


    @Override
    public String getDockerIp() {
        String url = resolveDockerHost();
        int idx = url.indexOf("://");
        if (idx > 0) {
            url = url.substring(idx + 3);
        }
        idx = url.indexOf(":");
        if (idx > 0) {
            url = url.substring(0, idx);
        }
        return url;
    }

    @Override
    protected String getDefaultObjectName() {
        return "io.fabric8:type=Kubernetes";
    }

    @Override
    public String getKubernetesAddress() {

        // First let's check if it's available as a kubernetes service like it should be...
        String address = System.getenv("KUBERNETES_SERVICE_HOST");
        if (Strings.isNotBlank(address)) {
            address = "http://" + address + ":" + System.getenv("KUBERNETES_SERVICE_PORT");
        } else {
            // If not then fall back to KUBERNETES_MASTER env var
            address = System.getenv("KUBERNETES_MASTER");
        }

        String username = System.getenv("KUBERNETES_USERNAME");
        String password = System.getenv("KUBERNETES_PASSWORD");

        if (Strings.isNotBlank(username) && Strings.isNotBlank(password)) {
            address = address.replaceFirst("://", "://" + username + ":" + password + "@");
        }

        return address;
    }

    @Override
    public String getHostName() {
        String answer = System.getenv("HOSTNAME");
        if (Strings.isBlank(answer)) {
            try {
                answer = InetAddress.getLocalHost().getHostName();
            } catch (UnknownHostException e) {
                LOG.warn("Could not look up local host name: " + e, e);
            }
        }
        return answer;
    }

    public GitFacade getGit() {
        if (git == null) {
            LOG.info("No GitFacade injected! Defaulting to the singleton");
            git = GitFacade.getSingleton();
        }
        return git;
    }

    public void setGit(GitFacade git) {
        this.git = git;
    }

    @Override
    public String iconPath(final String branch, final String kubernetesId) throws Exception {
        GitFacade facade = getGit();
        return facade.readFile(branch, "/", new Function<File, String>() {
            @Override
            public String apply(File rootFolder) {
                return doFindIconPath(rootFolder, kubernetesId);
            }
        });
    }

    protected String doFindIconPath(File rootFolder, String kubernetesId) {
        File appFolder = findAppFolder(rootFolder, kubernetesId);
        if (appFolder != null) {
            File[] files = appFolder.listFiles();
            if (files != null) {
                for (File file : files) {
                    String name = file.getName();
                    if (name.startsWith("icon.") &&
                            (name.endsWith(".svg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".pdf"))) {
                        try {
                            return Files.getRelativePath(rootFolder, file);
                        } catch (IOException e) {
                            LOG.warn("failed to get relative folder of " + file.getAbsolutePath() + ". " + e, e);
                            return null;
                        }
                    }
                }
            }
        }
        return null;
    }

    protected File findAppFolder(File fileOrDirectory, String kubernetesId) {
        Pattern pattern = createKubernetesIdPattern(kubernetesId);
        return findAppFolder(fileOrDirectory, pattern);
    }

    public static Pattern createKubernetesIdPattern(String kubernetesId) {
        String regex = "\"id\"\\s*:\\s*\"" + kubernetesId + "\"";
        Pattern answer = Pattern.compile(regex);
        if (LOG.isDebugEnabled()) {
            LOG.debug("Finding kubernetes id via regex " + answer);
        }
        return answer;
    }


    protected File findAppFolder(File fileOrDirectory, Pattern pattern) {
        if (fileOrDirectory != null && fileOrDirectory.exists()) {
            if (fileOrDirectory.isFile()) {
                String name = fileOrDirectory.getName();
                if (name.equals("kubernetes.json")) {
                    if (fileTextMatchesPattern(fileOrDirectory, pattern)) {
                        return fileOrDirectory.getParentFile();
                    }
                }
            } else if (fileOrDirectory.isDirectory()) {
                File[] files = fileOrDirectory.listFiles();
                if (files != null) {
                    for (File file : files) {
                        File answer = findAppFolder(file, pattern);
                        if (answer != null) {
                            return answer;
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Returns true if the text of the given file matches the regex
     */
    public static boolean fileTextMatchesPattern(File file, Pattern pattern) {
        try {
            String text = IOHelper.readFully(file);
            return pattern.matcher(text).find();

        } catch (IOException e) {
            LOG.warn("Could not load file " + file.getAbsolutePath() + ". " + e, e);
            return false;
        }
    }

    public static String resolveHttpDockerHost() {
        String dockerHost = resolveDockerHost();
        if (dockerHost.startsWith("tcp:")) {
            return "http:" + dockerHost.substring(4);
        }
        return dockerHost;
    }

    public static String resolveDockerHost() {
        String dockerHost = System.getenv("DOCKER_HOST");
        if (isBlank(dockerHost)) {
            dockerHost = System.getProperty("docker.host");
        }
        if (!isBlank(dockerHost)) {
            return dockerHost;
        }
        return DEFAULT_DOCKER_HOST;
    }
}
