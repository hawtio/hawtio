package io.hawt.quarkus;

import io.hawt.web.auth.Redirector;

import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

@Singleton
public class HawtioProducers {

    @Produces
    @Singleton
    public Redirector initializeRedirector() {
        Redirector redirector = new Redirector();
        redirector.setApplicationContextPath(HawtioConfig.DEFAULT_CONTEXT_PATH);
        return redirector;
    }

}
