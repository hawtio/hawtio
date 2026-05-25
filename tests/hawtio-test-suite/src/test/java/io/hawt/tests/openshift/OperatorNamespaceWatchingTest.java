package io.hawt.tests.openshift;

import org.junit.jupiter.api.Test;

import org.apache.commons.lang3.RandomStringUtils;
import org.assertj.core.api.SoftAssertions;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import io.fabric8.kubernetes.api.model.EnvVarBuilder;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.Subscription;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.SubscriptionConfig;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.openshift.utils.BaseHawtioOnlineTest;
import io.hawt.tests.utils.HawtioOnlineTestUtils;
import io.hawt.v2.Hawtio;
import io.hawt.v2.HawtioSpec;

/**
 * Tests for operator namespace watching behavior based on WATCH_NAMESPACES configuration.
 * These tests verify that the operator correctly reconciles Hawtio CRs based on its
 * configured watch scope (AllNamespaces, OwnNamespace, SingleNamespace).
 *
 * WATCH_NAMESPACES behavior:
 * - Empty string ("") = AllNamespaces mode - watches all namespaces in the cluster
 * - Operator's own namespace = OwnNamespace mode - watches only where operator is installed
 * - Different single namespace = SingleNamespace mode - watches one specific namespace
 *
 * Note: MultiNamespace mode is deprecated and removed in OLMv1.
 *
 * Each test configures the operator to the required mode, runs the test, and restores original configuration.
 */
public class OperatorNamespaceWatchingTest extends BaseHawtioOnlineTest {
    private static final String OPERATOR_NAMESPACE = "openshift-operators";
    private static final String OPERATOR_DEPLOYMENT_NAME = "hawtio-operator";
    private static final String WATCH_NAMESPACES_ENV = "WATCH_NAMESPACES";

    /**
     * Tests that when operator is in AllNamespaces/Cluster mode, it reconciles Hawtio CRs across multiple namespaces.
     * Expected: All CRs get reconciled regardless of which namespace they're in.
     */
    @Test
    public void testAllNamespacesReconciliation() {
        final String namespace1 = "hawtio-ns-alpha-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        final String namespace2 = "hawtio-ns-omega-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        final String crName1 = "hawtio-cr-alpha";
        final String crName2 = "hawtio-cr-omega";

        HawtioOnlineTestUtils.withCleanup(() -> {
            // Configure operator for AllNamespaces mode (empty WATCH_NAMESPACES)
            configureOperatorWatchNamespaces("");

            // Create two separate namespaces
            OpenshiftClient.get().createNamespace(namespace1);
            OpenshiftClient.get().createNamespace(namespace2);

            // Deploy Hawtio CRs in both namespaces
            Hawtio hawtio1 = HawtioOnlineUtils.withBaseHawtio(crName1, namespace1, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });
            Hawtio hawtio2 = HawtioOnlineUtils.withBaseHawtio(crName2, namespace2, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });

            HawtioOnlineUtils.deployHawtioCR(hawtio1);
            HawtioOnlineUtils.deployHawtioCR(hawtio2);

            SoftAssertions sa = new SoftAssertions();

            Hawtio reconciledCR1 = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(namespace1).withName(crName1).get();
            sa.assertThat(reconciledCR1.getStatus().getPhase().name())
                .as("CR in namespace1 should be Deployed")
                .isEqualTo("DEPLOYED");
            sa.assertThat(reconciledCR1.getStatus().getURL())
                .as("CR in namespace1 should have a URL")
                .isNotNull()
                .isNotEmpty();

            Hawtio reconciledCR2 = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(namespace2).withName(crName2).get();
            sa.assertThat(reconciledCR2.getStatus().getPhase().name())
                .as("CR in namespace2 should be Deployed")
                .isEqualTo("DEPLOYED");
            sa.assertThat(reconciledCR2.getStatus().getURL())
                .as("CR in namespace2 should have a URL")
                .isNotNull()
                .isNotEmpty();

            sa.assertAll();
        }, () -> {
            OpenshiftClient.get().namespaces().withName(namespace1).delete();
            OpenshiftClient.get().namespaces().withName(namespace2).delete();
            restoreOperatorToAllNamespaces();
        });
    }

    /**
     * OwnNamespace Mode - Operator watches its own namespace only
     *
     * Tests that when operator watches only the namespace where it's installed (OwnNamespace mode):
     * - Reconciles CRs in the same namespace as the operator (openshift-operators)
     * - Ignores CRs in other namespaces
     *
     * Expected: Only CR in operator's namespace gets reconciled; CRs in other namespaces remain unreconciled.
     */
    @Test
    public void testOwnNamespaceIsolation() {
        final String ignoredNamespace = "hawtio-ignored-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        final String crNameInOperatorNs = "hawtio-cr-own-ns";
        final String crNameIgnored = "hawtio-cr-ignored";

        HawtioOnlineTestUtils.withCleanup(() -> {
            // Configure operator for OwnNamespace mode (WATCH_NAMESPACES = operator's own namespace)
            configureOperatorWatchNamespaces(OPERATOR_NAMESPACE);

            // Create namespace that should be ignored
            OpenshiftClient.get().createNamespace(ignoredNamespace);

            // Deploy CR in operator's own namespace - should reconcile
            Hawtio hawtioInOperatorNs = HawtioOnlineUtils.withBaseHawtio(crNameInOperatorNs, OPERATOR_NAMESPACE, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });
            HawtioOnlineUtils.deployHawtioCR(hawtioInOperatorNs);

            // Deploy CR in ignored namespace - should not reconcile
            Hawtio hawtioIgnored = HawtioOnlineUtils.withBaseHawtio(crNameIgnored, ignoredNamespace, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });
            OpenshiftClient.get().resources(Hawtio.class).inNamespace(ignoredNamespace).create(hawtioIgnored);

            // Wait for the CR to be created (verify it exists in etcd)
            WaitUtils.waitFor(() -> {
                Hawtio cr = OpenshiftClient.get().resources(Hawtio.class)
                    .inNamespace(ignoredNamespace).withName(crNameIgnored).get();
                return cr != null && cr.getMetadata() != null;
            }, "Waiting for ignored CR to be created", Duration.ofSeconds(5));

            // Wait for the operator to reconcile the CR in its own namespace
            WaitUtils.waitFor(() -> {
                Hawtio cr = OpenshiftClient.get().resources(Hawtio.class)
                    .inNamespace(OPERATOR_NAMESPACE).withName(crNameInOperatorNs).get();
                return cr != null
                    && cr.getStatus() != null
                    && cr.getStatus().getPhase() != null
                    && "DEPLOYED".equals(cr.getStatus().getPhase().name())
                    && cr.getStatus().getURL() != null;
            }, "Waiting for operator namespace CR to be reconciled", Duration.ofSeconds(20));

            SoftAssertions sa = new SoftAssertions();

            // Verify CR in operator's own namespace is reconciled
            Hawtio reconciledInOperatorNs = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(OPERATOR_NAMESPACE).withName(crNameInOperatorNs).get();
            sa.assertThat(reconciledInOperatorNs.getStatus().getPhase().name())
                .as("CR in operator's own namespace should be Deployed")
                .isEqualTo("DEPLOYED");
            sa.assertThat(reconciledInOperatorNs.getStatus().getURL())
                .as("CR in operator's own namespace should have a URL")
                .isNotNull();

            // Verify ignored CR exists but is not fully reconciled
            Hawtio ignoredCR = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(ignoredNamespace).withName(crNameIgnored).get();
            sa.assertThat(ignoredCR)
                .as("CR in ignored namespace should exist")
                .isNotNull();
            if (ignoredCR.getStatus() != null && ignoredCR.getStatus().getPhase() != null) {
                sa.assertThat(ignoredCR.getStatus().getPhase().name())
                    .as("CR in ignored namespace should not be fully deployed")
                    .isNotEqualTo("DEPLOYED");
            }

            sa.assertAll();
        }, () -> {
            OpenshiftClient.get().resources(Hawtio.class).inNamespace(OPERATOR_NAMESPACE).withName(crNameInOperatorNs).delete();
            OpenshiftClient.get().namespaces().withName(ignoredNamespace).delete();
            restoreOperatorToAllNamespaces();
        });
    }

    /**
     * Tests SingleNamespace mode where operator is installed in one namespace but watches a DIFFERENT namespace:
     * - Operator installed in openshift-operators namespace
     * - Operator watches a specific different namespace
     * - Ignores all other namespaces including operator's own namespace
     *
     * Expected: Only CR in the watched namespace gets fully deployed; CRs in other namespaces
     * may receive an initial status (e.g. Initialized) but should not reach Deployed phase.
     */
    @Test
    public void testSingleNamespaceMode() {
        final String watchedNamespace = "hawtio-watched-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        final String ignoredNamespace = "hawtio-ignored-" + RandomStringUtils.randomAlphabetic(5).toLowerCase();
        final String crNameInOperatorNs = "hawtio-operator-ns";
        final String crNameInWatchedNs = "hawtio-watched-ns";
        final String crNameInIgnoredNs = "hawtio-ignored-ns";

        HawtioOnlineTestUtils.withCleanup(() -> {
            // Create the watched namespace first (needed before configuring operator)
            OpenshiftClient.get().createNamespace(watchedNamespace);

            // Configure operator for SingleNamespace mode (WATCH_NAMESPACES = specific different namespace)
            configureOperatorWatchNamespaces(watchedNamespace);

            // Create ignored namespace
            OpenshiftClient.get().createNamespace(ignoredNamespace);

            // Deploy CR in operator's own namespace (should be ignored in SingleNamespace mode)
            Hawtio crInOperatorNs = HawtioOnlineUtils.withBaseHawtio(crNameInOperatorNs, OPERATOR_NAMESPACE, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });
            OpenshiftClient.get().resources(Hawtio.class).inNamespace(OPERATOR_NAMESPACE).create(crInOperatorNs);

            // Wait for CR in operator namespace to be created
            WaitUtils.waitFor(() -> {
                Hawtio cr = OpenshiftClient.get().resources(Hawtio.class)
                    .inNamespace(OPERATOR_NAMESPACE).withName(crNameInOperatorNs).get();
                return cr != null && cr.getMetadata() != null;
            }, "Waiting for CR in operator namespace to be created", Duration.ofSeconds(5));

            // Deploy CR in watched namespace (should be reconciled)
            Hawtio crInWatchedNs = HawtioOnlineUtils.withBaseHawtio(crNameInWatchedNs, watchedNamespace, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });
            HawtioOnlineUtils.deployHawtioCR(crInWatchedNs);

            // Deploy CR in ignored namespace (should be ignored)
            Hawtio crInIgnoredNs = HawtioOnlineUtils.withBaseHawtio(crNameInIgnoredNs, ignoredNamespace, h -> {
                h.getSpec().setType(HawtioSpec.Type.NAMESPACE);
            });
            OpenshiftClient.get().resources(Hawtio.class).inNamespace(ignoredNamespace).create(crInIgnoredNs);

            // Wait for CR in ignored namespace to be created
            WaitUtils.waitFor(() -> {
                Hawtio cr = OpenshiftClient.get().resources(Hawtio.class)
                    .inNamespace(ignoredNamespace).withName(crNameInIgnoredNs).get();
                return cr != null && cr.getMetadata() != null;
            }, "Waiting for CR in ignored namespace to be created", Duration.ofSeconds(5));

            // Wait for the operator to reconcile the CR in the watched namespace
            WaitUtils.waitFor(() -> {
                Hawtio cr = OpenshiftClient.get().resources(Hawtio.class)
                    .inNamespace(watchedNamespace).withName(crNameInWatchedNs).get();
                return cr != null
                    && cr.getStatus() != null
                    && cr.getStatus().getPhase() != null
                    && "DEPLOYED".equals(cr.getStatus().getPhase().name())
                    && cr.getStatus().getURL() != null;
            }, "Waiting for watched namespace CR to be reconciled", Duration.ofSeconds(20));

            SoftAssertions sa = new SoftAssertions();

            // Verify watched namespace CR is reconciled
            Hawtio reconciledWatched = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(watchedNamespace).withName(crNameInWatchedNs).get();
            sa.assertThat(reconciledWatched.getStatus().getPhase().name())
                .as("CR in watched namespace should be Deployed")
                .isEqualTo("DEPLOYED");
            sa.assertThat(reconciledWatched.getStatus().getURL())
                .as("CR in watched namespace should have a URL")
                .isNotNull();

            // Verify CR in operator's own namespace exists but is not fully reconciled (SingleNamespace != OwnNamespace)
            Hawtio crOperatorNs = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(OPERATOR_NAMESPACE).withName(crNameInOperatorNs).get();
            sa.assertThat(crOperatorNs)
                .as("CR in operator's own namespace should exist")
                .isNotNull();
            if (crOperatorNs.getStatus() != null && crOperatorNs.getStatus().getPhase() != null) {
                sa.assertThat(crOperatorNs.getStatus().getPhase().name())
                    .as("CR in operator's own namespace should not be fully deployed in SingleNamespace mode")
                    .isNotEqualTo("DEPLOYED");
            }

            // Verify CR in ignored namespace exists but is not fully reconciled
            Hawtio crIgnoredNs = OpenshiftClient.get().resources(Hawtio.class)
                .inNamespace(ignoredNamespace).withName(crNameInIgnoredNs).get();
            sa.assertThat(crIgnoredNs)
                .as("CR in ignored namespace should exist")
                .isNotNull();
            if (crIgnoredNs.getStatus() != null && crIgnoredNs.getStatus().getPhase() != null) {
                sa.assertThat(crIgnoredNs.getStatus().getPhase().name())
                    .as("CR in ignored namespace should not be fully deployed")
                    .isNotEqualTo("DEPLOYED");
            }

            sa.assertAll();
        }, () -> {
            OpenshiftClient.get().resources(Hawtio.class).inNamespace(OPERATOR_NAMESPACE).withName(crNameInOperatorNs).delete();
            OpenshiftClient.get().namespaces().withName(ignoredNamespace).delete();
            OpenshiftClient.get().namespaces().withName(watchedNamespace).delete();
            restoreOperatorToAllNamespaces();
        });
    }

    /**
     * Configures operator to watch specific namespaces via Subscription.
     * OLM will propagate changes to Deployment and restart the pod.
     * @param watchNamespaces Namespace to watch, or null/empty string for AllNamespaces mode (use default)
     */
    private void configureOperatorWatchNamespaces(String watchNamespaces) {
        updateSubscriptionEnv(WATCH_NAMESPACES_ENV, watchNamespaces);
        waitForOperatorRollout();
    }

    /**
     * Updates an environment variable in the operator Subscription.
     * @param name Environment variable name
     * @param value Environment variable value, or null/empty to remove the override
     */
    private void updateSubscriptionEnv(String name, String value) {
        OpenshiftClient.get().resources(Subscription.class)
            .inNamespace(OPERATOR_NAMESPACE)
            .withName("red-hat-hawtio-operator")
            .edit(sub -> {
                var spec = sub.getSpec();
                var config = Optional.ofNullable(spec.getConfig()).orElseGet(SubscriptionConfig::new);
                var envs = Optional.ofNullable(config.getEnv()).orElseGet(ArrayList::new);

                // Clean & Replace
                envs.removeIf(e -> e.getName().equals(name));
                if (value != null && !value.isEmpty()) {
                    envs.add(new EnvVarBuilder().withName(name).withValue(value).build());
                }

                config.setEnv(envs);
                spec.setConfig(config);
                return sub;
            });
    }

    /**
     * Waits for the operator Deployment to complete rollout after configuration changes.
     */
    private void waitForOperatorRollout() {
        // First, wait for any old pods to fully terminate
        WaitUtils.waitFor(() -> {
            var pods = OpenshiftClient.get().pods()
                .inNamespace(OPERATOR_NAMESPACE)
                .withLabel("name", OPERATOR_DEPLOYMENT_NAME)
                .list()
                .getItems();

            // No pods should be in terminating state
            return pods.stream().noneMatch(pod -> pod.getMetadata().getDeletionTimestamp() != null);
        }, "Waiting for old operator pods to terminate", Duration.ofSeconds(60));

        // Then wait for deployment to be ready
        OpenshiftClient.get().apps().deployments()
            .inNamespace(OPERATOR_NAMESPACE)
            .withName(OPERATOR_DEPLOYMENT_NAME)
            .waitUntilReady(3, TimeUnit.MINUTES);

        // Finally, ensure exactly one pod is running and ready
        WaitUtils.waitFor(() -> {
            var pods = OpenshiftClient.get().pods()
                .inNamespace(OPERATOR_NAMESPACE)
                .withLabel("name", OPERATOR_DEPLOYMENT_NAME)
                .list()
                .getItems();

            if (pods.size() != 1) {
                return false;
            }

            var pod = pods.get(0);
            var phase = pod.getStatus().getPhase();

            // Fail fast only on terminal failure states
            // Do not fail on transient states like "Pending" or "ContainerCreating"
            if ("Failed".equals(phase)) {
                throw new AssertionError("Operator pod failed - check pod logs for details");
            }
            if ("Unknown".equals(phase)) {
                throw new AssertionError("Operator pod in unknown state - possible node/kubelet issue");
            }

            // For non-running states (Pending, ContainerCreating), keep waiting
            if (!"Running".equals(phase)) {
                return false;
            }

            // Pod is terminating
            if (pod.getMetadata().getDeletionTimestamp() != null) {
                return false;
            }

            // Check all containers are ready
            return pod.getStatus().getContainerStatuses() != null
                && pod.getStatus().getContainerStatuses().stream()
                    .allMatch(cs -> Boolean.TRUE.equals(cs.getReady()));
        }, "Waiting for operator to settle into new watch mode", Duration.ofSeconds(30));
    }

    /**
     * Restores operator to AllNamespaces mode (OLMv1 default).
     */
    private void restoreOperatorToAllNamespaces() {
        configureOperatorWatchNamespaces("");
    }
}
