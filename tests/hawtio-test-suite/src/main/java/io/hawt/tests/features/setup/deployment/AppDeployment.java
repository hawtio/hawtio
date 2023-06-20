package io.hawt.tests.features.setup.deployment;

public interface AppDeployment {
    void start();
    void stop();

    String getURL();
}
