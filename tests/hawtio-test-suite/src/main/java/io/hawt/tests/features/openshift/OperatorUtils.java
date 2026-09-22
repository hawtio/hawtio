package io.hawt.tests.features.openshift;

import java.io.ByteArrayInputStream;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.EnvVarBuilder;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.Subscription;
import io.fabric8.openshift.api.model.operatorhub.v1alpha1.SubscriptionConfig;

/**
 * Helpers for inspecting and reconfiguring the cluster-wide Hawtio Operator that is installed via
 * OLM into the {@code openshift-operators} namespace.
 *
 * <p>Operator behavior is customized through environment variables (for example
 * {@code WATCH_NAMESPACES} or {@code CERTIFICATE_EXPIRY_PERIOD}). These are set on the Operator's
 * OLM Subscription; OLM then propagates the change to the Operator Deployment and rolls out a new
 * pod.
 */
public final class OperatorUtils {

    public static final String OPERATOR_NAMESPACE = "openshift-operators";
    public static final String OPERATOR_DEPLOYMENT_NAME = "hawtio-operator";
    public static final String OPERATOR_SUBSCRIPTION_NAME = "red-hat-hawtio-operator";
    /**
     * Master proxy certificate secret, managed by the Operator in its own namespace. Its expiry is
     * governed by {@code CERTIFICATE_EXPIRY_PERIOD}. The per-CR {@code <cr-name>-tls-proxying-<hash>}
     * secrets are slave copies of it (the hash is derived from this master's content).
     */
    public static final String MASTER_PROXY_SECRET_NAME = OPERATOR_DEPLOYMENT_NAME + "-tls-proxying";

    private OperatorUtils() {
    }

    /**
     * Reads the value of an environment variable currently applied to the Operator Deployment.
     * @param name Environment variable name
     * @return the value, or {@code null} when no such variable is present
     */
    public static String getEnv(String name) {
        final Deployment deployment = OpenshiftClient.get().apps().deployments()
            .inNamespace(OPERATOR_NAMESPACE)
            .withName(OPERATOR_DEPLOYMENT_NAME)
            .get();
        if (deployment == null) {
            return null;
        }
        return deployment.getSpec().getTemplate().getSpec().getContainers().stream()
            .flatMap(c -> c.getEnv().stream())
            .filter(e -> name.equals(e.getName()))
            .findFirst()
            // getValue() is null for variables sourced via valueFrom (e.g. OLM-managed WATCH_NAMESPACES)
            .map(EnvVar::getValue)
            .orElse(null);
    }

    /**
     * Sets (or, with a null/empty value, removes) an environment variable on the Operator via its
     * OLM Subscription, then waits for the Operator to roll out with the new configuration.
     * @param name Environment variable name
     * @param value Environment variable value, or null/empty to remove the override
     */
    public static void setEnv(String name, String value) {
        updateSubscriptionEnv(name, value);
        waitForRollout();
    }

    /**
     * Updates an environment variable in the Operator Subscription. OLM propagates the change to the
     * Deployment and restarts the pod. Use {@link #setEnv(String, String)} to also wait for the
     * rollout to complete.
     * @param name Environment variable name
     * @param value Environment variable value, or null/empty to remove the override
     */
    public static void updateSubscriptionEnv(String name, String value) {
        OpenshiftClient.get().resources(Subscription.class)
            .inNamespace(OPERATOR_NAMESPACE)
            .withName(OPERATOR_SUBSCRIPTION_NAME)
            .edit(sub -> {
                var spec = sub.getSpec();
                var config = Optional.ofNullable(spec.getConfig()).orElseGet(SubscriptionConfig::new);
                var envs = Optional.ofNullable(config.getEnv()).orElseGet(ArrayList::new);

                // Clean and replace
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
     * Waits for the Operator Deployment to complete rollout after configuration changes.
     */
    public static void waitForRollout() {
        // First, wait for any old pods to fully terminate
        WaitUtils.waitFor(() ->
            // No pods should be in terminating state
            operatorPods().stream().noneMatch(pod -> pod.getMetadata().getDeletionTimestamp() != null),
            "Waiting for old operator pods to terminate", Duration.ofSeconds(60));

        // Then wait for deployment to be ready
        OpenshiftClient.get().apps().deployments()
            .inNamespace(OPERATOR_NAMESPACE)
            .withName(OPERATOR_DEPLOYMENT_NAME)
            .waitUntilReady(3, TimeUnit.MINUTES);

        // Finally, ensure exactly one pod is running and ready
        WaitUtils.waitFor(() -> {
            var pods = operatorPods();

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
        }, "Waiting for operator to settle after configuration change", Duration.ofSeconds(30));
    }

    /**
     * Lists the current Operator pods in the Operator namespace.
     */
    private static List<Pod> operatorPods() {
        return OpenshiftClient.get().pods()
            .inNamespace(OPERATOR_NAMESPACE)
            .withLabel("name", OPERATOR_DEPLOYMENT_NAME)
            .list()
            .getItems();
    }

    /**
     * Deletes the master proxy certificate secret in the Operator namespace and waits for it to be
     * gone. The Operator (re)generates this secret just-in-time when a Hawtio CR is reconciled; an
     * already-existing master is not refreshed merely because {@code CERTIFICATE_EXPIRY_PERIOD}
     * changed. Deleting it therefore forces the next CR to mint a fresh master certificate at the
     * current expiry period.
     */
    public static void deleteMasterProxySecret() {
        final Secret existing = masterSecret();
        if (existing == null) {
            // Nothing to delete; the next reconcile mints a fresh master at the current expiry period.
            return;
        }
        final String previousUid = existing.getMetadata().getUid();

        OpenshiftClient.get().secrets()
            .inNamespace(OPERATOR_NAMESPACE)
            .withName(MASTER_PROXY_SECRET_NAME)
            .delete();

        // The Operator wholly manages the proxy-certificate lifecycle and may re-mint the master
        // almost immediately, so waiting for the secret to be simply gone is racy. Accept either
        // outcome: it disappeared, or it was replaced by a freshly minted secret (different UID).
        WaitUtils.waitFor(() -> {
            final Secret current = masterSecret();
            return current == null || !previousUid.equals(current.getMetadata().getUid());
        }, "Waiting for master proxy secret to be deleted or regenerated", Duration.ofSeconds(60));
    }

    /**
     * Waits for the master proxy certificate secret to exist (with its {@code tls.crt} data) and
     * returns it.
     */
    public static Secret getMasterProxySecret() {
        return WaitUtils.withRetry(() -> {
            Secret secret = masterSecret();
            if (secret == null || secret.getData() == null || !secret.getData().containsKey("tls.crt")) {
                throw new IllegalStateException("Master proxy secret " + MASTER_PROXY_SECRET_NAME + " not created yet");
            }
            return secret;
        }, 60, Duration.ofSeconds(1));
    }

    /**
     * Returns the master proxy certificate secret in the Operator namespace, or {@code null} when it
     * does not currently exist.
     */
    private static Secret masterSecret() {
        return OpenshiftClient.get().secrets()
            .inNamespace(OPERATOR_NAMESPACE)
            .withName(MASTER_PROXY_SECRET_NAME)
            .get();
    }

    /**
     * Waits for the master proxy certificate secret and returns the length of the certificate's
     * validity window (notBefore to notAfter). This reflects the expiry the Operator applied from
     * {@code CERTIFICATE_EXPIRY_PERIOD} when it minted the master certificate.
     *
     * <p><strong>Contract:</strong> the Operator only mints the master certificate just-in-time and
     * does not refresh an existing one when {@code CERTIFICATE_EXPIRY_PERIOD} changes. To observe a
     * changed expiry, call {@link #deleteMasterProxySecret()} <em>before</em> the CR that triggers
     * regeneration; otherwise this returns the validity of a stale certificate.
     *
     * <p>Callers comparing whole hours via {@link Duration#toHours()} should note it truncates, so
     * the hour count is only exact for whole-hour expiry periods.
     */
    public static Duration masterProxyCertValidity() {
        final Secret secret = getMasterProxySecret();
        final byte[] pem = Base64.getDecoder().decode(secret.getData().get("tls.crt"));
        try {
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            X509Certificate cert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(pem));
            return Duration.between(cert.getNotBefore().toInstant(), cert.getNotAfter().toInstant());
        } catch (CertificateException e) {
            throw new IllegalStateException("Failed to parse master proxy certificate from secret " + MASTER_PROXY_SECRET_NAME, e);
        }
    }
}
