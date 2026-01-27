package io.hawt.tests.openshift;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import org.apache.commons.lang3.RandomStringUtils;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.pageobjects.fragments.online.DiscoverTab;
import io.hawt.tests.features.pageobjects.fragments.openshift.DeploymentEntry;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;
import io.hawt.tests.openshift.utils.BaseHawtioOnlineTest;
import io.hawt.tests.utils.HawtioOnlineTestUtils;

public class NamespacedDiscoveryTest extends BaseHawtioOnlineTest {

    @Test
    public void testMultipleReplicas() {
        HawtioOnlineTestUtils.withPatchDeployment(d -> {
            d.getSpec().setReplicas(2);
        }, () -> {
            WaitUtils.untilAsserted(() -> {
                var discover = new DiscoverTab();
                var deployment = discover.assertContainsDeployment(OpenshiftDeployment.DEFAULT_APP_NAME);

                assertThat(deployment.getPods()).hasSize(2).allSatisfy(pod -> {
                    assertThat(pod.getStatus()).isEqualToIgnoringCase("running");
                    assertThat(pod.getNamespace()).isEqualTo(TestConfiguration.getOpenshiftNamespace());
                });
            }, Duration.ofSeconds(30));
        });
    }

    @Test
    public void testMultipleDeployments() {
        final String name = "e2e-hawtio-second-deployment";
        HawtioOnlineTestUtils.withCleanup(() -> {
            final Deployment deployment = HawtioOnlineUtils.deployApplication(name, "springboot",
                TestConfiguration.getOpenshiftNamespace(), "5.x-" + (System.getProperty("java.vm.specification.version", "17")));
            OpenshiftClient.get().apps().deployments().resource(deployment).waitUntilReady(2, TimeUnit.MINUTES);

            WaitUtils.untilAsserted(() -> {
                var discover = new DiscoverTab();

                discover.assertContainsDeployment(name);
            }, Duration.ofSeconds(5));
        }, () -> {
            OpenshiftClient.get().apps().deployments().withName(name).delete();
        });
    }

    @Test
    public void testNamespaceRestriction() {
        final String namespace = "hawtio-discover-test-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        final String deploymentName = "hawtio-discover-test";
        HawtioOnlineTestUtils.withCleanup(() -> {
            OpenshiftClient.get().createNamespace(namespace);
            HawtioOnlineUtils.deployApplication(deploymentName, "springboot", namespace, "5.x-" + (System.getProperty("java.vm.specification.version", "17")));

            var discover = new DiscoverTab();

            final Map<String, DeploymentEntry> deployments = discover.getDeployments();
            assertThat(deployments).doesNotContainKey(deploymentName);
        }, () -> {
            OpenshiftClient.get().namespaces().withName(namespace).delete();
        });
    }
}
