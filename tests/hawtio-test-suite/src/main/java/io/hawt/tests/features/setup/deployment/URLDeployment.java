package io.hawt.tests.features.setup.deployment;

public class URLDeployment implements AppDeployment {

    private final String url;

    public URLDeployment(String url) {
        this.url = url;
    }

    @Override
    public void start() {

    }

    @Override
    public void stop() {

    }

    @Override
    public String getURL() {
        return url;
    }
}
