package io.hawt.tests.openshift;

import static com.codeborne.selenide.Selenide.$;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import org.apache.commons.lang3.RandomStringUtils;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;

import java.time.Duration;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.pageobjects.fragments.online.DiscoverTab;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
import io.hawt.tests.features.utils.ByUtils;
import io.hawt.tests.openshift.utils.BaseHawtioOnlineTest;
import io.hawt.tests.utils.HawtioOnlineTestUtils;
import io.hawt.v2.Hawtio;

public class ClusterDiscoveryTest extends BaseHawtioOnlineTest {
    public static final String CLUSTER_HAWTIO_NAME = "e2e-cluster-hawtio";

    @BeforeAll
    public static void patchHawtio() {
        final String clusterUrl = HawtioOnlineUtils.deployClusterHawtio(CLUSTER_HAWTIO_NAME,
            TestConfiguration.getOpenshiftNamespace());
        Selenide.open(clusterUrl, HawtioOnlineLoginPage.class)
            .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
        //The initial load of the whole cluster takes a while
        $(ByUtils.byDataTestId("loading")).shouldNot(Condition.exist, Duration.ofSeconds(60));
    }

    @AfterAll
    public static void cleanup() {
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
                discoverPage.assertContainsDeployment("e2e-discover-app", namespace);
            }, Duration.ofMinutes(2));
        }, () -> {
            OpenshiftClient.get().namespaces().withName(namespace).delete();
        });
    }
}
