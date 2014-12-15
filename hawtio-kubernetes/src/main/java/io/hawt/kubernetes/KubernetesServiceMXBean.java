/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.kubernetes;

import java.io.IOException;
import java.util.List;

/**
 */
public interface KubernetesServiceMXBean {

    /**
     * Returns the Kubernetes Master REST API URL.
     *
     * Typically this is the value of the <b>KUBERNETES_MASTER</b> environment variable
     * which if you are running it locally is <code>http://localhost:8080</code>
     */
    String getKubernetesAddress();

    /**
     * Returns the Docker Host (or IP address).
     *
     * If you are running Kubernetes locally on your laptop and running hawtio outside of docker
     * then this host will be different to localhost.
     *
     * This method will look at the DOCKER_HOST environment variable to find the IP address of
     * docker and use that instead of localhost/127.0.0.1.
     */
    String getDockerIp();

    String getHostName();

    /**
     * Returns the icon path for the given kubernetes ID and git branch or null if one cannot be found
     */
    String iconPath(String branch, String kubernetesId) throws Exception;

    String appPath(String branch, String kubernetesId) throws Exception;

    List<AppDTO> findApps(String branch) throws Exception;
}
