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
import io.hawt.util.*;
import io.hawt.web.ServiceResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
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
        if (System.getenv("KUBERNETES_SERVICE_HOST") != null || System.getenv("KUBERNETES_MASTER") != null) {
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
        String address = ServiceResolver.getSingleton().getServiceURL("kubernetes");
        if (Strings.isBlank(address)) {
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

    @Override
    public String appPath(final String branch, final String kubernetesId) throws Exception {
        GitFacade facade = getGit();
        return facade.readFile(branch, "/", new Function<File, String>() {
            @Override
            public String apply(File rootFolder) {
                File file = findAppFolder(rootFolder, kubernetesId);
                if (file != null) {
                    return relativePath(rootFolder, file);
                } else {
                    return null;
                }
            }
        });
    }

    @Override
    public List<AppDTO> findApps(final String branch) throws Exception {
        GitFacade facade = getGit();
        return facade.readFile(branch, "/", new Function<File, List<AppDTO>>() {
            @Override
            public List<AppDTO> apply(File rootFolder) {
                List<AppDTO> answer = new ArrayList<AppDTO>();
                doAddApps(rootFolder, rootFolder, answer);
                return answer;
            }
        });
    }

    protected String doFindIconPath(File rootFolder, String kubernetesId) {
        File appFolder = findAppFolder(rootFolder, kubernetesId);
        return doFindAppIconPath(rootFolder, appFolder);
    }

    protected String doFindAppIconPath(File rootFolder, File appFolder) {
        if (appFolder != null) {
            File[] files = appFolder.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (isIconFile(file)) {
                        return relativePath(rootFolder, file);
                    }
                }
            }
        }
        return null;
    }

    public static boolean isIconFile(File file) {
        String name = file.getName();
        return name.startsWith("icon.") &&
                (name.endsWith(".svg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".pdf"));
    }

    protected static String relativePath(File rootFolder, File file) {
        try {
            return Files.getRelativePath(rootFolder, file);
        } catch (IOException e) {
            LOG.warn("failed to get relative folder of " + file.getAbsolutePath() + ". " + e, e);
            return null;
        }
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


    protected void doAddApps(File rootFolder, File fileOrDirectory, List<AppDTO> apps) {
        if (fileOrDirectory != null && fileOrDirectory.exists()) {
            if (fileOrDirectory.isFile()) {
                if (isKubernetesMetadataFile(fileOrDirectory)) {
                    AppDTO app = createAppDto(rootFolder, fileOrDirectory);
                    if (app != null) {
                        apps.add(app);
                    }
                }
            } else if (fileOrDirectory.isDirectory()) {
                File[] files = fileOrDirectory.listFiles();
                if (files != null) {
                    for (File file : files) {
                        doAddApps(rootFolder, file, apps);
                    }
                }
            }
        }
    }

    protected AppDTO createAppDto(File rootFolder, File kubeFile) {
        File appFolder = kubeFile.getParentFile();
        String appPath = relativePath(rootFolder, appFolder);
        String kubePath = relativePath(rootFolder, kubeFile);
        String iconPath = doFindAppIconPath(rootFolder, appFolder);
        Properties properties = new Properties();
        File propertiesFile = new File(appFolder, "fabric8.properties");
        if (propertiesFile.exists() && propertiesFile.isFile()) {
            try {
                properties.load(new FileInputStream(propertiesFile));
            } catch (Exception e) {
                LOG.warn("Failed to load fabric8 properties file " + propertiesFile + ". " + e, e);
            }
        }

        String name = properties.getProperty("name", appFolder.getName());
        String description = properties.getProperty("description");
        String version = properties.getProperty("version");
        String groupId = properties.getProperty("groupId");
        String artifactId = properties.getProperty("artifactId");
        return new AppDTO(appPath, iconPath, name, description, kubePath, version, groupId, artifactId);
    }


    protected File findAppFolder(File fileOrDirectory, Pattern pattern) {
        if (fileOrDirectory != null && fileOrDirectory.exists()) {
            if (fileOrDirectory.isFile()) {
                if (isKubernetesMetadataFile(fileOrDirectory)) {
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

    public static boolean isKubernetesMetadataFile(File fileOrDirectory) {
        String name = fileOrDirectory.getName();
        return name.equals("kubernetes.json") || name.equals("kubernetes.yml") || name.equals("kubernetes.yaml");
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
