package io.hawt.tests.utils;

import org.junit.Assume;
import org.junit.function.ThrowingRunnable;
import org.junit.platform.commons.util.ExceptionUtils;

import org.apache.commons.lang3.SerializationUtils;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.HawtioOnlineUtils;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;
import io.hawt.v2.Hawtio;

public class HawtioOnlineTestUtils {

    public static Deployment getAppDeployment() {
        return ((OpenshiftDeployment) TestConfiguration.getAppDeploymentMethod()).getAppDeployment();
    }

    public static void withModifiedBaseHawtio(Consumer<Hawtio> action, ThrowingRunnable test) {
        final Hawtio prevValue = OpenshiftClient.get().resources(Hawtio.class).withName(OpenshiftDeployment.DEFAULT_APP_NAME).get();
        HawtioOnlineUtils.patchHawtioResource(OpenshiftDeployment.DEFAULT_APP_NAME, action);
        try {
            test.run();
        } catch (Throwable t) {
            ExceptionUtils.throwAsUncheckedException(t);
        } finally {
            HawtioOnlineUtils.patchHawtioResource(OpenshiftDeployment.DEFAULT_APP_NAME, prevValue);
        }
    }

    public static void withCleanup(ThrowingRunnable test, Runnable cleanup) {
        try {
            test.run();
        } catch (Throwable t) {
            ExceptionUtils.throwAsUncheckedException(t);
        } finally {
            cleanup.run();
        }
    }

    public static void withPatchDeployment(Consumer<Deployment> action, ThrowingRunnable test) {
        Assume.assumeTrue("App deployment exists",getAppDeployment() != null);
        AtomicReference<Deployment> prevDeployment = new AtomicReference<>();

        try {
            WaitUtils.withRetry(() -> {
                final Deployment deployment =
                    OpenshiftClient.get().apps().deployments().resource(getAppDeployment()).get();

                prevDeployment.set(SerializationUtils.clone(deployment));
                action.accept(deployment);
                OpenshiftClient.get().apps().deployments().resource(getAppDeployment()).patch(deployment);
                OpenshiftClient.get().apps().deployments().resource(getAppDeployment()).waitUntilReady(1, TimeUnit.MINUTES);

            }, 5, Duration.ofSeconds(100));

            test.run();
        } catch (Throwable t) {
            ExceptionUtils.throwAsUncheckedException(t);
        } finally {
            Deployment deployment = OpenshiftClient.get().apps().deployments().resource(getAppDeployment()).get();
            deployment.setSpec(prevDeployment.get().getSpec());
            OpenshiftClient.get().apps().deployments().resource(deployment).update();
            OpenshiftClient.get().apps().deployments().resource(deployment).waitUntilReady(1, TimeUnit.MINUTES);
        }
    }
}
