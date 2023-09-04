package io.hawt.quarkus.filters;

import java.util.Arrays;

import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;

import io.hawt.quarkus.HawtioConfig;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.LoginRedirectFilter;
import io.hawt.web.auth.Redirector;
import io.quarkus.arc.Arc;

public class HawtioQuarkusLoginRedirectFilter extends LoginRedirectFilter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Redirector redirector = Arc.container().instance(Redirector.class).get();
        setRedirector(redirector);

        filterConfig.getServletContext().setAttribute(ATTRIBUTE_UNSECURED_PATHS, prependContextPath());

        super.init(filterConfig);
    }

    private static String[] prependContextPath() {
        return Arrays.stream(AuthenticationConfiguration.UNSECURED_PATHS)
            .map(path -> HawtioConfig.DEFAULT_CONTEXT_PATH + path)
            .toArray(String[]::new);
    }
}
