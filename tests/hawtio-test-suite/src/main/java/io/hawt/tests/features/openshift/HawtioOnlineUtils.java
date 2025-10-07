package io.hawt.tests.features.openshift;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.assertj.core.api.Assertions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import io.fabric8.kubernetes.api.model.ContainerPortBuilder;
import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.GenericKubernetesResource;
import io.fabric8.kubernetes.api.model.HasMetadata;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.client.dsl.Resource;
import io.fabric8.kubernetes.client.dsl.base.ResourceDefinitionContext;
import io.fabric8.openshift.api.model.operatorhub.lifecyclemanager.v1.PackageManifest;
import io.fabric8.openshift.api.model.operatorhub.v1.OperatorGroupBuilder;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.CatalogSource;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.CatalogSourceBuilder;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.ClusterServiceVersion;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.SubscriptionBuilder;
import io.fabric8.openshift.client.dsl.OpenShiftOperatorHubAPIGroupDSL;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.v2.Hawtio;
import io.hawt.v2.HawtioSpec;

public class HawtioOnlineUtils {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioOnlineUtils.class);

    private static final ResourceDefinitionContext INTEGRATION_PLATFORM_CRD = new ResourceDefinitionContext.Builder()
        .withGroup("camel.apache.org")
        .withVersion("v2")
        .withKind("IntegrationPlatform")
        .withPlural("integrationplatforms")
        .withNamespaced(true)
        .build();

    public static Deployment deployApplication(String name, String runtime, String namespace, String tag) {
        List<EnvVar> envVars = new LinkedList<>();
        Map<String, String> annotations = new HashMap<>();
        int containerPort = 10001;

        annotations.put("hawt.io/protocol", "http");

        switch (runtime.toLowerCase()) {
            case "quarkus":
                annotations.put("hawt.io/jolokiaPath", "/hawtio/jolokia/");
                containerPort = 8080;
                break;

            case "springboot":
                envVars.add(new EnvVar("AB_JOLOKIA_AUTH_OPENSHIFT", "cn=hawtio-online.hawtio.svc", null));
                envVars.add(new EnvVar("AB_JOLOKIA_OPTS", "caCert=/var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt", null));
                annotations.put("hawt.io/jolokiaPath", "/actuator/jolokia/");
                containerPort = 10001;
                break;

            case "camelk":
                deployCamelKOperator();
                try {
                    final String source =
                        IOUtils.toString(HawtioOnlineUtils.class.getResource("/io/hawt/tests/openshift/camelk-e2e-integration.groovy"),
                            StandardCharsets.UTF_8);
                    deployCamelKIntegration("e2e-integration", source, "groovy");
                } catch (IOException e) {
                    Assertions.fail("Failed to deploy a Camel K integration", e);
                }
                return null;
        }

        //@formatter:off
        final String imageName = runtime.toLowerCase() + "-test-app";
        final DeploymentBuilder deploymentBuilder = new DeploymentBuilder()
            .editOrNewMetadata()
                .withName(name)
                .addToLabels("app", name)
                .withNamespace(namespace)
                .endMetadata()
            .editOrNewSpec()
                .editOrNewSelector()
                    .addToMatchLabels("app", name)
                .endSelector()
                .editOrNewTemplate()
                    .editOrNewMetadata()
                        .addToAnnotations(annotations)
                        .addToLabels("app", name)
                        //Used to differentiate the pod hash of the Replica Sets
                        .addToLabels("randomId", RandomStringUtils.randomAlphabetic(5))
                    .endMetadata()
                    .editOrNewSpec()
                        .addNewContainer()
                            .addAllToEnv(envVars)
                            .withName("app")
                            .withImage("quay.io/hawtio/hawtio-"+ imageName + ":" + tag + "-noauth")
                            .withImagePullPolicy("Always")
                            .withPorts(new ContainerPortBuilder().withName("jolokia").withContainerPort(containerPort).withProtocol("TCP").build())
                        .endContainer()
                    .endSpec()
                .endTemplate()
            .endSpec();

        final Deployment deployment = OpenshiftClient.get().apps().deployments().createOrReplace(deploymentBuilder.build());
        //@formatter:on

        WaitUtils.waitFor(() -> {
            return OpenshiftClient.get(namespace)
                .getPodLog(OpenshiftClient.get().pods().inNamespace(namespace).withLabel("app", name).list()
                    .getItems().get(0))
                .contains("Hello Camel!");
        }, "Waiting for app to get running", Duration.ofMinutes(2));

        LOG.info("Deployed application {}", name);

        return deployment;
    }

    public static void deployCamelKOperator() {
        final CatalogSource redhatCatalog =
            OpenshiftClient.get().operatorHub().catalogSources().inNamespace("openshift-marketplace").withName(TestConfiguration.getCamelKCatalog())
                .get();
        createSubscription(redhatCatalog, "red-hat-camel-k");

        WaitUtils.waitFor(() -> {
            final GenericKubernetesResource ip =
                OpenshiftClient.get().genericKubernetesResources(INTEGRATION_PLATFORM_CRD).withName("camel-k").get();
            if (ip == null) {
                return false;
            }

            return ip.get("status", "phase").equals("Ready");
        }, "Waiting for Integration Platform to get ready", Duration.ofMinutes(5));
    }

    public static HasMetadata deployCamelKIntegration(String integrationSource) {
        var integration = (GenericKubernetesResource) OpenshiftClient.get().resource(integrationSource).create();
        LOG.info("Waiting for the Camel K integration to be ready");
        OpenshiftClient.get().resource(integration).waitUntilCondition(resource -> {
            String status = resource.get("status", "phase");
            return status != null && status.equalsIgnoreCase("Running");
        }, 10, TimeUnit.MINUTES);

        return integration;
    }

    public static HasMetadata deployCamelKIntegration(String name, String source, String language) {
        var integration = Map.of(
            "kind", "Integration",
            "apiVersion", "camel.apache.org/v1",
            "metadata", Map.of(
                "name", name,
                "namespace", OpenshiftClient.get().getNamespace(),
                "labels", Map.of(
                    "app", "e2e-app"
                )
            ),
            "spec", Map.of(
                "traits", Map.of(
                    "builder", Map.of(
                        "configuration", Map.of(
                            "properties", List.of("quarkus.camel.debug.enabled = true")
                        )
                    ),
                    "jolokia", Map.of(
                        "enabled", true,
                        "discoveryEnabled", true
                    ),
                    "owner", Map.of(
                        "enabled", true,
                        "targetLabels", List.of("app")
                    ),
                    "camel", Map.of(
                        "properties", List.of(
                            "camel.context.name = SampleCamel",
                            "quarkus.camel.debug.enabled = true",
                            "camel.trace.enabled = true"
                        )
                    )
                ),
                "sources", List.of(
                    Map.of(
                        "content", source,
                        "language", language,
                        "name", "source." + language
                    )
                ),
                "dependencies", List.of(
                    "camel:timer",
                    "camel:debug"
                )
            )
        );

        return deployCamelKIntegration(new Yaml().dump(integration));
    }

    public static String createSubscription(final CatalogSource catalog, String packageManifestName) {
        final OpenShiftOperatorHubAPIGroupDSL operatorhub = OpenshiftClient.get().operatorHub();
        final PackageManifest packageManifest = WaitUtils.withRetry(() -> operatorhub.packageManifests()
                .withLabel("catalog", catalog.getMetadata().getName())
                .list()
                .getItems()
                .stream()
                //Sometimes there's a conflict with community-operators, which is why it has to be filtered this way
                .filter(manifest -> manifest.getMetadata().getName().toLowerCase().endsWith(packageManifestName))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Could not find hawtio-operator package manifest installed by the catalog")), 2,
            Duration.ofSeconds(30));

        final String defaultChannel = packageManifest.getStatus().getDefaultChannel();
        final String startingCSV = packageManifest.getStatus().getChannels().stream()
            .filter(channel -> channel.getName().equals(defaultChannel)).findFirst().get().getCurrentCSV();

        operatorhub.operatorGroups().createOrReplace(new OperatorGroupBuilder()
            .editOrNewMetadata()
            .withName("hawtio-operator-og")
            .endMetadata()
            .editOrNewSpec()
            .addToTargetNamespaces(TestConfiguration.getOpenshiftNamespace())
            .endSpec()
            .build());

        final String subscriptionName = packageManifest.getMetadata().getName();
        operatorhub.subscriptions().createOrReplace(new SubscriptionBuilder()
            .editOrNewMetadata()
            .withName(subscriptionName)
            .endMetadata()
            .editOrNewSpec()
            .withChannel(defaultChannel)
            .withInstallPlanApproval("Automatic")
            .withName(subscriptionName)
            .withSource(catalog.getMetadata().getName())
            .withSourceNamespace(catalog.getMetadata().getNamespace())
            .withStartingCSV(startingCSV)
            .endSpec()
            .build());

        //@formatter:on
        WaitUtils.waitFor(() -> {
            var ip = operatorhub.subscriptions().withName(subscriptionName).get().getStatus().getInstallPlanRef();
            if (ip == null) {
                return false;
            }

            return operatorhub.installPlans().withName(ip.getName()).get()
                .getStatus().getPhase().equals("Complete");
        }, "Waiting for the installplan to finish", Duration.ofMinutes(3));

        return startingCSV;
    }

    public static void deployOperator() {
        final OpenShiftOperatorHubAPIGroupDSL operatorhub = OpenshiftClient.get().operatorHub();
        CatalogSource catalog = null;
        if (TestConfiguration.getIndexImage() != null) {
            //@formatter:off
            operatorhub.catalogSources().createOrReplace(new CatalogSourceBuilder()
                    .editOrNewMetadata()
                        .withName("hawtio-catalog")
                    .endMetadata()
                    .editOrNewSpec()
                        .withImage(TestConfiguration.getIndexImage())
                        .withSourceType("grpc")
                    .endSpec()
                .build());

            WaitUtils.waitFor(() -> operatorhub.catalogSources().withName("hawtio-catalog")
                .get()
                .getStatus()
                .getConnectionState()
                .getLastObservedState()
                .equalsIgnoreCase("READY"),
                "Waiting for the catalog to get ready", Duration.ofMinutes(2));
            catalog = operatorhub.catalogSources().withName("hawtio-catalog").get();
        } else {
            catalog = operatorhub.catalogSources().inNamespace("openshift-marketplace").withName("redhat-operators").get();
        }
        final String startingCSV = createSubscription(catalog, "hawtio-operator");

        if (TestConfiguration.getHawtioOnlineGatewayImageRepository() != null || TestConfiguration.getHawtioOnlineImageRepository() != null) {
            WaitUtils.withRetry(() -> {
                final ClusterServiceVersion csv = operatorhub.clusterServiceVersions().withName(startingCSV).get();
                if (TestConfiguration.getHawtioOnlineImageRepository() != null) {
                    csv.getSpec().getInstall().getSpec().getDeployments().get(0).getSpec().getTemplate().getSpec().getContainers().get(0).getEnv()
                        .add(new EnvVar("IMAGE_REPOSITORY", TestConfiguration.getHawtioOnlineImageRepository(), null));
                }
                if (TestConfiguration.getHawtioOnlineGatewayImageRepository() != null) {

                    csv.getSpec().getInstall().getSpec().getDeployments().get(0).getSpec().getTemplate().getSpec().getContainers().get(0).getEnv()
                        .add(new EnvVar("GATEWAY_IMAGE_REPOSITORY", TestConfiguration.getHawtioOnlineGatewayImageRepository(), null));
                }
                operatorhub.clusterServiceVersions().withName(startingCSV).patch(csv);
            }, 5, Duration.ofSeconds(5));

            WaitUtils.waitFor(() -> OpenshiftClient.get().pods().withLabel("name", "hawtio-operator").list().getItems().stream().anyMatch(pod ->
                    pod.getSpec().getContainers().stream().anyMatch(container -> container.getEnv().stream().anyMatch(envVar -> envVar.getName().equalsIgnoreCase("IMAGE_REPOSITORY") || envVar.getName().equalsIgnoreCase("GATEWAY_IMAGE_REPOSITORY"))) &&
                        pod.getStatus().getPhase().equalsIgnoreCase("Running")),
                "Waiting for the CSV patch to get applied to the operator pod", Duration.ofMinutes(2));
        }
    }

    public static String deployHawtioCR(Hawtio hawtio) {
        hawtio.getMetadata().getFinalizers().clear();
        OpenshiftClient.get().resources(Hawtio.class).createOrReplace(hawtio);

        WaitUtils.waitFor(() -> {
            final Resource<Hawtio> resource = OpenshiftClient.get().resources(Hawtio.class)
                .withName(hawtio.getMetadata().getName());
            return resource.isReady() && resource.get().getStatus().getPhase().name().equalsIgnoreCase("Deployed") &&
                resource.get().getStatus().getURL() != null;
        }, "Waiting for hawtio deployment to succeed", Duration.ofMinutes(2));

        return OpenshiftClient.get().resources(Hawtio.class).withName(hawtio.getMetadata().getName()).get().getStatus()
            .getURL();
    }

    public static String deployNamespacedHawtio(String name, String namespace) {
        return deployHawtioCR(withBaseHawtio(name, namespace, hawtio -> {
            hawtio.getSpec().setType(HawtioSpec.Type.NAMESPACE);
        }));
    }

    public static String deployClusterHawtio(String name, String namespace) {
        return deployHawtioCR(withBaseHawtio(name, namespace, hawtio -> {
            hawtio.getSpec().setType(HawtioSpec.Type.CLUSTER);
        }));
    }

    public static Hawtio withBaseHawtio(String name, String namespace, Consumer<Hawtio> modifier) {
        var hawtio = new Hawtio();
        hawtio.getMetadata().setName(name);
        hawtio.getMetadata().setNamespace(namespace);
        var spec = new HawtioSpec();
        hawtio.setSpec(spec);

        modifier.accept(hawtio);
        return hawtio;
    }

    public static void patchHawtioResource(String name, Consumer<Hawtio> action) {
        WaitUtils.withRetry(() -> {
            final Hawtio hawtio = OpenshiftClient.get().resources(Hawtio.class).withName(name).get();
            action.accept(hawtio);
            OpenshiftClient.get().resources(Hawtio.class).withName(name).patch(hawtio);
        }, 5, Duration.ofMillis(500));
    }

    public static void patchHawtioResource(String name, Hawtio value) {
        WaitUtils.withRetry(() -> {
            OpenshiftClient.get().resources(Hawtio.class).withName(name).patch(value);
        }, 5, Duration.ofMillis(500));
    }

    public static void deleteHawtio(Hawtio hawtio) {
        OpenshiftClient.get().resource(hawtio).delete();
    }
}
