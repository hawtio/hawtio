package io.hawt.tests.openshift;

import static org.assertj.core.api.Assertions.assertThat;

import org.apache.commons.lang3.tuple.Pair;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import org.openqa.selenium.NoSuchWindowException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.client.dsl.Resource;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.hooks.DeployAppHook;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.pageobjects.fragments.online.DiscoverTab;
import io.hawt.tests.features.pageobjects.fragments.openshift.DeploymentEntry;
import io.hawt.tests.features.pageobjects.fragments.openshift.PodEntry;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlinePage;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;
import io.hawt.tests.openshift.utils.BaseHawtioOnlineTest;
import io.hawt.tests.openshift.utils.OpenshiftTest;
import io.hawt.tests.utils.HawtioOnlineTestUtils;

@OpenshiftTest
public class HawtioOnlineShellTest extends BaseHawtioOnlineTest {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioOnlineShellTest.class);

    @AfterEach
    public void openBrowser() {
        try {
            while (WebDriverRunner.getWebDriver().getWindowHandles().size() > 1) {
                Selenide.closeWindow();
                Selenide.switchTo().window(0);
            }
            if (!WebDriverRunner.url().startsWith(DeployAppHook.getBaseURL())) {
                Selenide.refresh();
                Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
                    .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
            }
        } catch (NoSuchWindowException e) {
            Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
                .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
        }
    }

    @Test
    public void testConsoleLink() {
        var hawtio = new HawtioOnlinePage();

        hawtio.clickConsoleLink();
        switchToNewTab();
        checkOcpLink("Overview", null);
    }

    @Test
    public void checkDeploymentLinks() {
        final DeploymentEntry deployment = getDeployment();
        final PodEntry pod = deployment.getPods().get(0);

        var tests = Map.of(
            deployment.getDeploymentURL(), Pair.of( DiscoverTab.REPLICA_SET_WORKAROUND ? "ReplicaSet" : "Deployment", deployment.getName()),
            pod.getPodURL(), Pair.of("Pod", pod.getName()),
            // TODO: Selectors must be added
            // pod.getWorkerURL(), Pair.of("Node", pod.getWorker()),
            pod.getNamespaceURL(), Pair.of("Project", pod.getNamespace())
        );
        tests.forEach((url, values) -> {
            Selenide.open(url);
            WaitUtils.waitForPageLoad();
            new HawtioOnlineLoginPage().login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
            checkOcpLink(values.getLeft(), values.getRight());
        });
    }

    @Test
    public void checkSearch() {
        final DeploymentEntry deployment = getDeployment();

        deployment.getPods().get(0).clickOnLabel("app");
        switchToNewTab();
        checkOcpLink("Search", null);
    }

    @Test
    public void checkPodDisplay() {
        final DeploymentEntry deploymentEntry = getDeployment();

        final List<PodEntry> pods = WaitUtils.withRetry(() -> {
            final Deployment appDeployment = HawtioOnlineTestUtils.getAppDeployment();
            var p = deploymentEntry.getPods();

            assertThat(p.stream().filter(pod -> pod.getStatus().equalsIgnoreCase("Running"))).hasSize(appDeployment.getStatus().getReplicas());
            return p;
        }, 5, Duration.ofSeconds(20));

        assertThat(pods.get(0)).satisfies(pod -> {
            final Pod podResource = OpenshiftClient.get().getPod(pod.getName());

            assertThat(pod.getReadyContainerCount()).isEqualTo(pod.getTotalContainerCount());
            assertThat(pod.getTotalContainerCount()).isEqualTo(podResource.getSpec().getContainers().size());
            assertThat(pod.getRouteCount()).isEqualTo(6);
            assertThat(pod.getNamespace()).isEqualTo(podResource.getMetadata().getNamespace());

            assertThat(pod.getLabels()).containsAllEntriesOf(pod.getLabels());
        });
    }

    @Test
    public void checkPodStatus() {
        final OpenshiftClient client = OpenshiftClient.get();
        final Resource<Deployment> appDeployment = client.apps().deployments().resource(HawtioOnlineTestUtils.getAppDeployment());

        HawtioOnlineTestUtils.withCleanup(() -> {
            final DeploymentEntry deploymentEntry = getDeployment();

            assertThat(deploymentEntry.getPods()).allMatch(pod -> pod.getStatus().equalsIgnoreCase("Running"));

            appDeployment.scale(3);

            WaitUtils.untilAsserted(() -> {
                assertThat(deploymentEntry.getPods()).hasSize(3);
                assertThat(deploymentEntry.getPods()).allMatch(pod -> pod.getStatus().toLowerCase().matches("running|containercreating"));
            }, Duration.ofSeconds(20));
            //TODO: https://github.com/hawtio/hawtio-online/issues/290

        }, () -> {
            appDeployment.scale(1);
            appDeployment.waitUntilReady(20, TimeUnit.SECONDS);
        });
    }

    private static void switchToNewTab() {
        final int handles = Selenide.webdriver().driver().getWebDriver().getWindowHandles().size();
        Selenide.switchTo().window(handles - 1);
        //Wait for the new tab to fully load
        WaitUtils.waitForPageLoad();
        new HawtioOnlineLoginPage().login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
    }

    private static DeploymentEntry getDeployment() {
        var hawtio = new HawtioOnlinePage();
        final DiscoverTab discover = hawtio.getDiscoverTab();

        return discover.assertContainsDeployment(OpenshiftDeployment.DEFAULT_APP_NAME);
    }

    private static void checkOcpLink(String resourceType, String resourceName) {
        String separator = " · ";
        WaitUtils.untilAsserted(() -> {
            final String[] parts = Selenide.title().split(separator);
            if (resourceName != null) {
                assertThat(parts[0]).isEqualToIgnoringCase(resourceName);
                assertThat(parts[1]).isEqualTo(resourceType);
            } else {
                assertThat(parts[0]).isEqualToIgnoringCase(resourceType);
            }
        }, Duration.ofSeconds(20));
    }
}
