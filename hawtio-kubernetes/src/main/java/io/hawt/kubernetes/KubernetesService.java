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

import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.UnknownHostException;

import static io.hawt.util.Strings.isBlank;

/**
 * Helper MBean to expose the <a href="http://kubernetes.io/">Kubernetes</a> REST API
 */
public class KubernetesService extends MBeanSupport implements KubernetesServiceMXBean {

    public static final String DEFAULT_DOCKER_HOST = "tcp://localhost:2375";
    private static final transient Logger LOG = LoggerFactory.getLogger(KubernetesService.class);

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
        return System.getenv("KUBERNETES_MASTER");
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
