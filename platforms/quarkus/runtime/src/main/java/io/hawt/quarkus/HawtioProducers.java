package io.hawt.quarkus;

import io.hawt.web.auth.Redirector;

import javax.enterprise.inject.Produces;
import javax.inject.Singleton;

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
