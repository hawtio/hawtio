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

/**
 * Helper MBean to expose the <a href="http://kubernetes.io/">Kubernetes</a> REST API
 */
public class KubernetesService extends MBeanSupport implements KubernetesServiceMXBean {

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
    protected String getDefaultObjectName() {
        return "io.fabric8:type=Kubernetes";
    }

    @Override
    public String getKubernetesAddress() {
        return System.getenv("KUBERNETES_MASTER");
    }
}
