package io.hawt.tests.features.setup.deployment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.client.dsl.RollableScalableResource;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;

public class OpenshiftDeployment implements AppDeployment {

    private static final Logger LOG = LoggerFactory.getLogger(OpenshiftDeployment.class);

    public static final String DEFAULT_APP_NAME = "e2e-app";
    public static final String DEFAULT_HAWTIO_NAME = "e2e-hawtio";

    private String host;
    private Deployment appDeployment;

    @Override
    public void start() {
        HawtioOnlineUtils.deployOperator();
        host = HawtioOnlineUtils.deployNamespacedHawtio(DEFAULT_HAWTIO_NAME, TestConfiguration.getOpenshiftNamespace());
        appDeployment = HawtioOnlineUtils.deployApplication(DEFAULT_APP_NAME, TestConfiguration.getRuntime(), TestConfiguration.getOpenshiftNamespace(), "5.x-" + (System.getProperty("java.vm.specification.version", "17")));
    }

    @Override
    public void stop() {
        if (TestConfiguration.openshiftNamespaceDelete()) {
            LOG.info("Undeploying Hawtio project {}", TestConfiguration.getOpenshiftNamespace());
            LOG.info("Calling namespace delete...");
            OpenshiftClient.get().namespaces()
                .withName(TestConfiguration.getOpenshiftNamespace())
                .withGracePeriod(0L)
                .delete();
            LOG.info("Namespace delete call returned");
        }
    }

    public void restartApp() {
        if (appDeployment != null) {
            OpenshiftClient.get().pods().withLabel("name", DEFAULT_APP_NAME).delete();
        }
    }

    public boolean isRunning() {
        final Deployment deployment =
            OpenshiftClient.get().apps().deployments().withName(DEFAULT_APP_NAME).get();
        if (deployment == null) {
            return false;
        }
        return deployment.getStatus().getReadyReplicas() > 0;
    }

    public Deployment getAppDeployment() {
        return OpenshiftClient.get().apps().deployments().withName(DEFAULT_APP_NAME).get();
    }

    public void ensureRunning() {
        if (isRunning()) {
            return;
        }
        start();
    }

    @Override
    public String getURL() {
        return host;
    }
}
