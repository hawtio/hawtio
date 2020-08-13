package io.hawt.quarkus;

import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.LoginRedirectFilter;
import io.hawt.web.auth.Redirector;
import io.quarkus.arc.Arc;

import java.util.Arrays;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;

public class HawtioQuarkusLoginRedirectFilter extends LoginRedirectFilter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Redirector redirector = Arc.container().instance(Redirector.class).get();
        setRedirector(redirector);

        filterConfig.getServletContext().setAttribute("unsecuredPaths", prependContextPath(HawtioConfig.DEFAULT_CONTEXT_PATH, AuthenticationConfiguration.UNSECURED_PATHS));

        super.init(filterConfig);
    }

    private static String[] prependContextPath(String contextPath, String[] paths) {
        return Arrays.stream(paths)
            .map(path -> contextPath + path)
            .toArray(String[]::new);
    }
}
