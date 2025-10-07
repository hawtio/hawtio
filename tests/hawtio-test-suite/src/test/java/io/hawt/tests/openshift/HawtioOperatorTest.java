package io.hawt.tests.openshift;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.SoftAssertions;
import org.awaitility.Awaitility;
import org.openqa.selenium.NoSuchElementException;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import io.fabric8.kubernetes.api.model.ConfigMapBuilder;
import io.fabric8.kubernetes.api.model.IntOrString;
import io.fabric8.kubernetes.api.model.NamespaceBuilder;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.client.dsl.PodResource;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.pageobjects.fragments.about.AboutModalWindow;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.features.pageobjects.fragments.online.DiscoverTab;
import io.hawt.tests.features.pageobjects.fragments.openshift.DeploymentEntry;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
import io.hawt.tests.features.setup.LoginLogout;
import io.hawt.tests.openshift.utils.BaseHawtioOnlineTest;
import io.hawt.tests.utils.HawtioOnlineTestUtils;
import io.hawt.v2.Hawtio;
import io.hawt.v2.HawtioSpec;
import io.hawt.v2.hawtiospec.Auth;
import io.hawt.v2.hawtiospec.Config;
import io.hawt.v2.hawtiospec.MetadataPropagation;
import io.hawt.v2.hawtiospec.Nginx;
import io.hawt.v2.hawtiospec.Rbac;
import io.hawt.v2.hawtiospec.Resources;
import io.hawt.v2.hawtiospec.config.About;
import io.hawt.v2.hawtiospec.config.Branding;
import io.hawt.v2.hawtiospec.config.Online;
import io.hawt.v2.hawtiospec.config.about.ProductInfo;
import io.hawt.v2.hawtiospec.config.online.ConsoleLink;

public class HawtioOperatorTest extends BaseHawtioOnlineTest {

    private static Deployment deployment;
    private static String podName;

    private static Hawtio hawtio;

    @BeforeAll
    public static void setupApp() {
        String name = "camel-app-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        deployment = HawtioOnlineUtils.deployApplication(name, "springboot", TestConfiguration.getOpenshiftNamespace(), "4.x-" + (System.getProperty("java.vm.specification.version", "21")));
        podName = OpenshiftClient.get().pods().withLabel("app", name).list().getItems().get(0).getMetadata().getName();
    }

    @AfterEach
    public void closeBrowser() {
        while (WebDriverRunner.getWebDriver().getWindowHandles().size() != 1) {
            Selenide.closeWindow();
            Selenide.switchTo().window(0);
        }
    }

    @AfterAll
    public static void cleanup() {
        OpenshiftClient.get().resource(deployment).delete();
    }

    @Test
    public void testDisabledRoutes() {
        runTest(s -> {
            Config config = new Config();
            config.setDisabledRoutes(List.of("/camel", "/quartz"));
            s.setConfig(config);
        }, (sa) -> {
            var discoverTab = new DiscoverTab();
            discoverTab.assertContainsDeployment(deployment.getMetadata().getName());
            discoverTab.connectTo(podName);

            WaitUtils.waitForPageLoad();

            var hawtio = new HawtioPage();
            Assertions.assertThatCode(() -> {
                hawtio.menu().navigateTo("Camel");
            }).hasCauseInstanceOf(NoSuchElementException.class);
        });
    }

    @Test
    public void testUICustomization() {
        Config config = new Config();
        runTest(s -> {
            About about = new About();
            about.setImgSrc("https://i1.sndcdn.com/artworks-zyYqA8D0BdfuyH28-WeeHrw-t500x500.jpg");
            about.setTitle("MeowIO About");
            about.setAdditionalInfo("Hello world");
            final ProductInfo productInfo = new ProductInfo();
            productInfo.setName("Testsuite");
            productInfo.setValue("latest");

            about.setProductInfo(List.of(productInfo));
            about.setCopyright("Hawtio QE team");
            config.setAbout(about);

            Branding branding = new Branding();
            branding.setAppLogoUrl("https://i1.sndcdn.com/artworks-zyYqA8D0BdfuyH28-WeeHrw-t500x500.jpg");
            branding.setAppName("MeowIO");

            config.setBranding(branding);
            s.setConfig(config);
        }, (sa) -> {
            var discoverTab = new DiscoverTab();
            discoverTab.assertContainsDeployment(deployment.getMetadata().getName());
            discoverTab.connectTo(podName);

            WaitUtils.waitForPageLoad();
            var hawtio = new HawtioPage();

            hawtio.panel().openMenuItemUnderQuestionMarkDropDownMenu("About");
            var aboutPanel = new AboutModalWindow();
            sa.assertThat(aboutPanel.getBrandImage().getAttribute("src")).isEqualTo(config.getAbout().getImgSrc());
            sa.assertThat(aboutPanel.getBrandImage().getAttribute("alt")).isEqualTo(config.getAbout().getTitle());

            sa.assertThat(aboutPanel.getAppComponents()).containsEntry("Testsuite", "latest");
            sa.assertThat(aboutPanel.getHeaderText()).isEqualTo(config.getAbout().getTitle());
            aboutPanel.close();

            sa.assertThat(hawtio.getAppName()).isEqualTo(config.getBranding().getAppName());
            sa.assertThat(hawtio.getLogo().getAttribute("src")).isEqualTo(config.getBranding().getAppLogoUrl());
            sa.assertThat(hawtio.getLogo().getAttribute("alt")).isEqualTo(config.getBranding().getAppName());
        });
    }

    @Test
    public void testResources() {
        runTest(spec -> {
            Resources resources = new Resources();
            resources.setRequests(Map.of("memory", new IntOrString("1G"), "cpu", new IntOrString("0.5")));
            resources.setLimits(Map.of("memory", new IntOrString("2G"), "cpu", new IntOrString("1.0")));
            spec.setResources(resources);

            spec.setReplicas(2);
        }, sa -> {
            waitForHawtioReady();
            sa.assertThat(OpenshiftClient.get().pods().withLabel("deployment", hawtio.getMetadata().getName()).list().getItems())
                .hasSizeGreaterThanOrEqualTo(2)
                .allSatisfy(pod -> {
                    final Map<String, Quantity> requests = pod.getSpec().getContainers().get(0).getResources().getRequests();
                    assertThat(requests.get("memory")).satisfies(memory -> {
                        assertThat(memory.getAmount()).isEqualTo("1");
                        assertThat(memory.getFormat()).isEqualTo("G");
                    });

                    assertThat(requests.get("cpu")).satisfies(cpu -> {
                        assertThat(cpu.getAmount()).isEqualTo("500");
                        assertThat(cpu.getFormat()).isEqualTo("m");
                    });

                    final Map<String, Quantity> limits = pod.getSpec().getContainers().get(0).getResources().getLimits();

                    assertThat(limits.get("memory")).satisfies(memory -> {
                        assertThat(memory.getAmount()).isEqualTo("2");
                        assertThat(memory.getFormat()).isEqualTo("G");
                    });

                    assertThat(limits.get("cpu")).satisfies(cpu -> {
                        assertThat(cpu.getAmount()).isEqualTo("1");
                        assertThat(cpu.getFormat()).isEqualTo("");
                    });
                });
        }, false);
    }

    @Test
    public void testProjectSelector() {
        final String namespace = "selector-tests-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();

        OpenshiftClient.get()
            .resource(new NamespaceBuilder().withNewMetadata().withName(namespace).addToLabels("myLabel", namespace).endMetadata().build()).create();

        HawtioOnlineTestUtils.withCleanup(() -> {
            HawtioOnlineUtils.deployApplication("selector-test-springboot", "springboot", namespace, "4.x-" + (System.getProperty("java.vm.specification.version", "21")));

            runTest(spec -> {

                Config config = new Config();
                Online online = new Online();

                online.setProjectSelector("myLabel=" + namespace);
                spec.setType(HawtioSpec.Type.CLUSTER);

                config.setOnline(online);
                spec.setConfig(config);
            }, sa -> {

                var discoverTab = new DiscoverTab();
                final Map<String, DeploymentEntry> deployments = discoverTab.getDeployments();

                sa.assertThat(deployments).hasSize(1);
                sa.assertThat(deployments).allSatisfy((key, value) -> {
                    assertThat(value.getPods().get(0).getNamespace()).isEqualTo(namespace);
                });
            });
        }, () -> {
            OpenshiftClient.get().projects().withName(namespace).delete();
        });
    }

    @Test
    public void testConsoleLink() {
        runTest(spec -> {
            Config config = new Config();
            Online online = new Online();

            ConsoleLink consoleLink = new ConsoleLink();

            consoleLink.setText("My link");

            online.setConsoleLink(consoleLink);

            config.setOnline(online);
            spec.setConfig(config);
        }, sa -> {

            sa.assertThat(
                    OpenshiftClient.get().console().consoleLinks().withName(hawtio.getMetadata().getName() + "-" + hawtio.getMetadata().getNamespace()))
                .satisfies(link -> assertThat(link.get().getSpec().getText()).isEqualTo("My link"));
        });
    }

    @Test
    public void testMetadataPropagation() {
        HawtioOnlineTestUtils.withCleanup(() -> {

            hawtio =
                HawtioOnlineUtils.withBaseHawtio("operator-test-" + RandomStringUtils.randomAlphabetic(5).toLowerCase(),
                    TestConfiguration.getOpenshiftNamespace(),
                    h -> {
                        h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
                        h.getMetadata().setLabels(Map.of("key", "value", "allowed_label", "value", "not_allowed_label", "value"));
                        h.getMetadata().setLabels(Map.of("key", "value", "allowed_annotation", "value", "not_allowed_annotation", "value"));

                        MetadataPropagation propagation = new MetadataPropagation();

                        propagation.setLabels(List.of("allowed_label", "key"));
                        propagation.setAnnotations(List.of("allowed_annotation", "key"));

                        h.getSpec().setMetadataPropagation(propagation);
                    });

            SoftAssertions sa = new SoftAssertions();
            HawtioOnlineUtils.deployHawtioCR(hawtio);

            sa.assertThat(OpenshiftClient.get().pods().withLabel("key").list().getItems()).hasSize(1);
            sa.assertThat(OpenshiftClient.get().services().withLabel("allowed_label").list().getItems()).hasSize(1);
            sa.assertThat(OpenshiftClient.get().services().withLabel("not_allowed_label").list().getItems()).hasSize(0);

            sa.assertThat(OpenshiftClient.get().apps().deployments().withLabel("allowed_label").list().getItems()).hasSize(1).allSatisfy(d -> {
                assertThat(d.getMetadata().getAnnotations()).containsKey("key").containsKey("allowed_annotation")
                    .doesNotContainKey("not_allowed_annotation");
            });
        }, () -> {
            HawtioOnlineUtils.deleteHawtio(hawtio);
        });
    }

    @Test
    public void testCustomHostName() {
        runTest(spec -> {
            spec.setRouteHostName("my-route");
        }, sa -> {
            String url = WaitUtils.withRetry(() -> OpenshiftClient.get().resource(hawtio).get().getStatus().getURL(), 5, Duration.ofSeconds(1));
            sa.assertThat(url).contains("my-route");
            sa.assertThat(OpenshiftClient.get().routes().withName(hawtio.getMetadata().getName()).get().getStatus().getIngress().get(0).getHost())
                .contains("my-route");
        }, false);
    }

    @Test
    public void testNginxResources() {
        final String clientBufferSize = "512k";
        final String proxyBuffers = "32 256k";
        final String outputBufferSize = "20m";
        runTest(spec -> {
            var nginx = new Nginx();
            nginx.setClientBodyBufferSize(clientBufferSize);
            nginx.setProxyBuffers(proxyBuffers);
            nginx.setSubrequestOutputBufferSize(outputBufferSize);
            spec.setNginx(nginx);
        }, sa -> {

            final String podName =
                OpenshiftClient.get().pods().withLabel("deployment", hawtio.getMetadata().getName()).list().getItems().get(0).getMetadata().getName();
            final PodResource pod = OpenshiftClient.get().pods().withName(podName);

            try {
                String config = IOUtils.toString(pod.file("/etc/nginx/conf.d/nginx.conf").read(), StandardCharsets.UTF_8);
                sa.assertThat(config)
                    .containsPattern("subrequest_output_buffer_size\\s+" + outputBufferSize)
                    .containsPattern("client_body_buffer_size\\s+" + clientBufferSize)
                    .containsPattern("proxy_buffers\\s+" + proxyBuffers);
            } catch (IOException e) {

                sa.fail("Couldn't get contents of nginx config", e);
            }
            Awaitility.waitAtMost(Duration.ofSeconds(10)).untilAsserted(() -> {
                assertThat(pod.inContainer(pod.get().getStatus().getContainerStatuses().stream().filter(c -> !c.getName().contains("gateway")).findAny().get().getName()).getLog()).contains("kube-probe");
            });
        }, false);
    }

    @Test
    public void testRBAC() throws IOException {
        OpenshiftClient.get().resource(new ConfigMapBuilder()
            .withNewMetadata()
            .withName("rbac-test")
            .endMetadata()
            .addToData("ACL.yaml", IOUtils.toString(getClass().getResource("/io/hawt/tests/openshift/acl.yaml"), StandardCharsets.UTF_8))
            .build()
        ).serverSideApply();
        runTest(spec -> {
            var rbac = new Rbac();
            rbac.setConfigMap("rbac-test");
            spec.setRbac(rbac);
        }, sa -> {
            var discoverTab = new DiscoverTab();
            discoverTab.assertContainsDeployment(deployment.getMetadata().getName());
            discoverTab.connectTo(podName);

            WaitUtils.waitForPageLoad();
            var hawtio = new HawtioPage();

            hawtio.menu().navigateTo("Camel");
            final CamelPage camelPage = new CamelPage();

            camelPage.tree().selectSpecificItem("CamelContexts-folder-SampleCamel-folder");
            camelPage.openTab("Operations");

            final CamelOperations camelOperations = new CamelOperations();
            camelOperations.checkOperation("stop()", Condition.disabled);
            camelOperations.checkOperation("getTotalRoutes()", Condition.enabled);

            hawtio.panel().logout();
            new HawtioOnlineLoginPage().login("viewer", "viewer");

            LoginLogout.hawtioIsLoaded();
            camelPage.tree().selectSpecificItem("CamelContexts-folder-SampleCamel-folder");
            camelPage.openTab("Operations");

            camelOperations.checkOperation("stop()", Condition.disabled);
            camelOperations.checkOperation("restart()", Condition.disabled);
            camelOperations.checkOperation("getTotalRoutes()", Condition.enabled);
        });
    }

    @Test
    public void testAuthConfig() {
        runTest(spec -> {
            Auth auth = new Auth();
            auth.setClientCertCommonName("my.hawtio.svc");
            auth.setClientCertCheckSchedule("* * * * *");
            auth.setClientCertExpirationPeriod(48L);
            auth.setClientCertExpirationDate(LocalDateTime.now().plusYears(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")));
            spec.setAuth(auth);
        }, sa -> {
            sa.assertThat(OpenshiftClient.get().batch().v1().cronjobs().withName(hawtio.getMetadata().getName() + "-certificate-expiry-check").get())
                .isNotNull()
                .matches(job -> job.getSpec().getSchedule().equals("* * * * *"))
                .matches(job -> job.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().get(0).getArgs().contains("48"));

            Assertions.assertThatCode(() -> {
                final String source = new String(Base64.getDecoder().decode(
                    OpenshiftClient.get().secrets().withName(hawtio.getMetadata().getName() + "-tls-proxying").get().getData().get("tls.crt")));
                final CertificateFactory cf = CertificateFactory.getInstance("X.509");
                final X509Certificate certificate =
                    (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(source.getBytes(StandardCharsets.UTF_8)));
                assertThat(certificate.getSubjectDN().getName()).isEqualTo("CN=my.hawtio.svc");
            }).doesNotThrowAnyException();
        }, false);
    }

    private static void runTest(Consumer<HawtioSpec> consumer, Consumer<SoftAssertions> testFunction) {
        runTest(consumer, testFunction, true);
    }

    private static void waitForHawtioReady() {
        WaitUtils.waitFor(() -> OpenshiftClient.get().resource(hawtio).get().getStatus().getSelector() != null,
            "Wait for Hawtio to be deployed", Duration.ofSeconds(5));
        final String selector = OpenshiftClient.get().resource(hawtio).get().getStatus().getSelector();
        final Map<String, String> labels =
            Arrays.stream(selector.split(",")).map(expr -> expr.split("=")).collect(Collectors.toMap(pair -> pair[0], pair -> pair[1]));
        WaitUtils.waitFor(() -> {
            final List<Pod> pods = OpenshiftClient.get().pods().withLabels(labels).list().getItems();
            return pods.stream().filter(p -> p.getStatus().getPhase().equalsIgnoreCase("running")).count() == hawtio.getSpec().getReplicas();
        }, "Waiting for all pods to be deployed", Duration.ofMinutes(1));
    }

    private static void runTest(Consumer<HawtioSpec> consumer, Consumer<SoftAssertions> testFunction, boolean startBrowser) {
        hawtio =
            HawtioOnlineUtils.withBaseHawtio("operator-test-" + RandomStringUtils.randomAlphabetic(5).toLowerCase(),
                TestConfiguration.getOpenshiftNamespace(),
                h -> {
                    h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
                    consumer.accept(h.getSpec());
                });
        var hawtioUrl = HawtioOnlineUtils.deployHawtioCR(hawtio);
        if (startBrowser) {
            Selenide.open(hawtioUrl, HawtioOnlineLoginPage.class)
                .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
        }

        HawtioOnlineTestUtils.withCleanup(() -> {
            SoftAssertions sa = new SoftAssertions();
            testFunction.accept(sa);

            sa.assertAll();
        }, () -> {
            HawtioOnlineUtils.deleteHawtio(hawtio);
        });
    }
}
