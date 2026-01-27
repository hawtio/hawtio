package io.hawt.tests.features.openshift;

import org.apache.commons.io.IOUtils;
import org.awaitility.Awaitility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;

import cz.xtf.core.openshift.OpenShift;
import io.fabric8.kubernetes.api.model.Namespace;
import io.fabric8.kubernetes.api.model.NamespaceBuilder;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.openshift.client.OpenShiftConfig;
import io.fabric8.openshift.client.OpenShiftConfigBuilder;
import io.hawt.tests.features.config.TestConfiguration;

public class OpenshiftClient extends OpenShift {

    private static final Logger LOG = LoggerFactory.getLogger(OpenshiftClient.class);
    private static OpenshiftClient client;

    public OpenshiftClient(OpenShiftConfig openShiftConfig) {
        super(openShiftConfig);
    }

    private static OpenshiftClient createInstance() {
        OpenShiftConfigBuilder configBuilder;

        if (TestConfiguration.getOpenshiftUrl() != null) {
            configBuilder = new OpenShiftConfigBuilder()
                .withMasterUrl(TestConfiguration.getOpenshiftUrl())
                .withUsername(TestConfiguration.getOpenshiftUsername())
                .withPassword(TestConfiguration.getOpenshiftPassword());
        } else if (TestConfiguration.openshiftKubeconfig() != null) {
            try {
                configBuilder = new OpenShiftConfigBuilder(
                    new OpenShiftConfig(Config.fromKubeconfig(IOUtils.toString(TestConfiguration.openshiftKubeconfig().toUri(), "UTF-8"))));
            } catch (IOException e) {
                throw new RuntimeException("Unable to read kubeconfig", e);
            }
        } else {
            LOG.info("Auto-configuring openshift client");
            configBuilder = new OpenShiftConfigBuilder(new OpenShiftConfig(Config.autoConfigure(null)));
        }

        String namespace = TestConfiguration.getOpenshiftNamespace();

        configBuilder
            .withNamespace(namespace)
//            .withHttpsProxy(TestConfiguration.openshiftHttpsProxy())
            .withBuildTimeout(60_000L)
            .withRequestTimeout(120_000)
            .withConnectionTimeout(120_000)
            .withTrustCerts(true);

        LOG.info("Using cluster {}", configBuilder.getMasterUrl());

        return new OpenshiftClient(configBuilder.build());
    }

    private static OpenshiftClient init() {
        final OpenshiftClient c = OpenshiftClient.createInstance();
        c.createNamespace(c.getNamespace());
        return c;
    }

    public static OpenshiftClient get() {
        if (client == null) {
            client = OpenshiftClient.init();
        }
        return client;
    }

    /**
     * Close the OpenShift client and release resources.
     */
    public static void closeClient() {
        if (client != null) {
            LOG.info("Closing OpenShift client");
            try {
                client.close();
                LOG.info("OpenShift client closed successfully");
            } catch (Exception e) {
                LOG.warn("Error closing OpenShift client", e);
            } finally {
                client = null;
            }
        }
    }

    /**
     * Create namespace with given name.
     *
     * @param name of namespace to be created
     */
    public void createNamespace(String name) {
        if ((name == null) || (name.isEmpty())) {
            LOG.info("Skipped creating namespace, name null or empty");
            return;
        }

        final Namespace namespace = this.namespaces().withName(name).get();
        if (namespace != null && namespace.getMetadata().getDeletionTimestamp() != null) {
            throw new RuntimeException("Namespace " + name + " already exists and is in Terminating state");
        }

        // @formatter:off
        Map<String, String> labels = Map.of("test.hawt.io/autoCreated", String.valueOf(TestConfiguration.openshiftNamespaceDelete()));
        Namespace ns = new NamespaceBuilder()
            .withNewMetadata()
            .withName(name)
            .withLabels(labels)
            .endMetadata().build();
        // @formatter:on
        if (this.namespaces().withName(name).get() == null) {
            this.namespaces().create(ns);
            Awaitility.await().until(() -> this.namespaces().withName(name).get() != null);
            WaitUtils.waitFor(() -> this.namespaces().withName(name).get() != null, "Waiting until the namespace " + name + " is created");
        } else {
            LOG.info("Skipped creating namespace " + name + ", already exists");
        }
    }
}
