package io.hawt.tests.features.hooks;

import org.junit.Assert;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.cucumber.java.Before;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.setup.deployment.AppDeployment;
import io.hawt.tests.features.setup.deployment.KeycloakDeployment;

public class DeployAppHook {

    private static final Logger LOG = LoggerFactory.getLogger(DeployAppHook.class);

    protected static AppDeployment app;
    protected static boolean executed = false;
    protected static Throwable startupFailure = null;

    @Before(order = 1)
    public static void appSetup() {
        if (executed) {
            if (startupFailure != null) {
                Assert.fail("Application is not running " + startupFailure.getMessage());
            }
            return;
        }
        try {
            executed = true;
            app = TestConfiguration.getAppDeploymentMethod();
            app.start();

            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                LOG.info("Starting Shutdown Hook Cleanup...");

                if (app != null) {
                    try {
                        app.stop();
                        LOG.info("App stopped");
                    } catch (Exception e) {
                        LOG.error("Error stopping app", e);
                    }
                }

                if (TestConfiguration.useKeycloak()) {
                    KeycloakDeployment.stop();
                }

                if (TestConfiguration.useOpenshift()) {
                    OpenshiftClient.closeClient();
                }

                LOG.info("Cleanup completed");
            }));
        } catch (Throwable e) {
            startupFailure = e;
            LOG.error("Failed to start the test app", e);
            Assert.fail("Application is not running " + startupFailure.getMessage());
        }
    }

    public static String getBaseURL() {
        if (startupFailure != null) {
            Assert.fail("Can't connect to an app that is not running " + startupFailure);
        }
        return app.getURL();
    }
}
