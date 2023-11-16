package io.hawt.tests.openshift;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import org.apache.commons.lang3.RandomStringUtils;

import com.codeborne.selenide.Selenide;

import java.time.Duration;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.pageobjects.fragments.online.DiscoverTab;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
import io.hawt.tests.openshift.utils.BaseHawtioOnlineTest;
import io.hawt.tests.utils.HawtioOnlineTestUtils;
import io.hawt.v1alpha1.Hawtio;

public class ClusterDiscoveryTest extends BaseHawtioOnlineTest {
    public static final String CLUSTER_HAWTIO_NAME = "e2e-cluster-hawtio";

    @BeforeAll
    public static void patchHawtio() {
        final String clusterUrl = HawtioOnlineUtils.deployClusterHawtio(CLUSTER_HAWTIO_NAME,
                TestConfiguration.getOpenshiftNamespace());
        Selenide.open(clusterUrl, HawtioOnlineLoginPage.class)
                .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
    }

    @AfterAll
    public static void setHawtioNamespaced() {
        OpenshiftClient.get().resources(Hawtio.class).withName(CLUSTER_HAWTIO_NAME).delete();
    }

    @Test
    public void basicTest() {
        final String namespace = "e2e-discover-namespace-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();

        HawtioOnlineTestUtils.withCleanup(() -> {
            OpenshiftClient.get().createNamespace(namespace);

            HawtioOnlineUtils.deployApplication("e2e-discover-app", "quarkus", namespace, "17");

            var discoverPage = new DiscoverTab();
            WaitUtils.untilAsserted(() -> {
                discoverPage.assertContainsDeployment("e2e-discover-app");
            }, Duration.ofSeconds(10));
        }, () -> {
            OpenshiftClient.get().namespaces().withName(namespace).delete();
        });
    }
}
