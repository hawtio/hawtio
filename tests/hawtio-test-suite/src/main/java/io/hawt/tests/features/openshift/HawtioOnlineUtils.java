package io.hawt.tests.features.openshift;

import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Consumer;

import io.fabric8.kubernetes.api.model.ContainerPortBuilder;
import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.client.dsl.Resource;
import io.fabric8.openshift.api.model.operatorhub.lifecyclemanager.v1.PackageManifest;
import io.fabric8.openshift.api.model.operatorhub.v1.OperatorGroupBuilder;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.CatalogSource;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.CatalogSourceBuilder;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.ClusterServiceVersion;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.SubscriptionBuilder;
import io.fabric8.openshift.client.dsl.OpenShiftOperatorHubAPIGroupDSL;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.v1alpha1.Hawtio;
import io.hawt.v1alpha1.HawtioSpec;

public class HawtioOnlineUtils {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioOnlineUtils.class);

    public static Deployment deployApplication(String name, String runtime, String namespace, String tag) {
        //@formatter:off
        List<EnvVar> envVars = new LinkedList<>();

        switch (runtime.toLowerCase()) {
            case "quarkus":
                //no-op for now
                break;

            case "springboot":
                envVars.add(new EnvVar("AB_JOLOKIA_AUTH_OPENSHIFT", "cn=hawtio-online.hawtio.svc", null));
                envVars.add(new EnvVar("AB_JOLOKIA_OPTS", "caCert=/var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt", null));
                break;
        }

        final String imageName = "example-camel-" + runtime.toLowerCase();
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
                        .addToLabels("app", name)
                        //Used to differentiate the pod hash of the Replica Sets
                        .addToLabels("randomId", RandomStringUtils.randomAlphabetic(5))
                    .endMetadata()
                    .editOrNewSpec()
                        .addNewContainer()
                            .addAllToEnv(envVars)
                            .withName("app")
                            .withImage("quay.io/hawtio/hawtio-online-"+ imageName + ":" + tag)
                            .withPorts(new ContainerPortBuilder().withName("jolokia").withContainerPort(8778).withProtocol("TCP").build())
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
        CatalogSource finalCatalog = catalog;
        final PackageManifest packageManifest = WaitUtils.withRetry(() -> operatorhub.packageManifests()
            .withLabel("catalog", finalCatalog.getMetadata().getName())
            .list()
            .getItems()
            .stream()
            //Sometimes there's a conflict with community-operators, which is why it has to be filtered this way
            .filter(manifest -> manifest.getMetadata().getName().toLowerCase().endsWith("hawtio-operator"))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find hawtio-operator package manifest installed by the catalog")), 2, Duration.ofSeconds(30));

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

        final String subscriptonName = packageManifest.getMetadata().getName();
        operatorhub.subscriptions().createOrReplace(new SubscriptionBuilder()
                .editOrNewMetadata()
                    .withName(subscriptonName)
                .endMetadata()
                .editOrNewSpec()
                    .withChannel(defaultChannel)
                    .withInstallPlanApproval("Automatic")
                    .withName(subscriptonName)
                    .withSource(catalog.getMetadata().getName())
                    .withSourceNamespace(catalog.getMetadata().getNamespace())
                    .withStartingCSV(startingCSV)
                .endSpec()
            .build());

        //@formatter:on
        WaitUtils.waitFor(() -> {
            var ip = operatorhub.subscriptions().withName(subscriptonName).get().getStatus().getInstallPlanRef();
            if (ip == null) {
                return false;
            }

            return operatorhub.installPlans().withName(ip.getName()).get()
                .getStatus().getPhase().equals("Complete");
        }, "Waiting for the installplan to finish", Duration.ofMinutes(3));

        if (TestConfiguration.getHawtioOnlineSHA() != null) {
            WaitUtils.withRetry(() -> {
                final ClusterServiceVersion csv = operatorhub.clusterServiceVersions().withName(startingCSV).get();
                csv.getSpec().getInstall().getSpec().getDeployments().get(0).getSpec().getTemplate().getSpec().getContainers().get(0).getEnv()
                    .add(new EnvVar("IMAGE_VERSION", TestConfiguration.getHawtioOnlineSHA(), null));
                if (TestConfiguration.getHawtioOnlineImageRepository() != null) {
                    csv.getSpec().getInstall().getSpec().getDeployments().get(0).getSpec().getTemplate().getSpec().getContainers().get(0).getEnv()
                        .add(new EnvVar("IMAGE_REPOSITORY", TestConfiguration.getHawtioOnlineImageRepository(), null));
                }
                operatorhub.clusterServiceVersions().withName(startingCSV).patch(csv);
            }, 5, Duration.ofSeconds(5));

            WaitUtils.waitFor(() -> OpenshiftClient.get().pods().withLabel("name", "hawtio-operator").list().getItems().stream().anyMatch(pod ->
                    pod.getSpec().getContainers().get(0).getEnv().stream().anyMatch(envVar -> envVar.getName().equalsIgnoreCase("IMAGE_VERSION")) &&
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
