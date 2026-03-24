package io.hawt.example.spring.boot;

import java.io.IOException;
import java.util.function.Supplier;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.springboot4.EndpointPathResolver;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class KeycloakConfiguration {

    private final EndpointPathResolver endpointPath;

    public KeycloakConfiguration(EndpointPathResolver endpointPath) {
        this.endpointPath = endpointPath;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        String hawtioPath = endpointPath.resolve("hawtio");

        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(hawtioPath + "/css/**").permitAll()
                .requestMatchers(hawtioPath + "/fonts/**").permitAll()
                .requestMatchers(hawtioPath + "/img/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Client(withDefaults())
            .oauth2Login(withDefaults())
            // see https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html#csrf-integration-javascript-spa
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
            )
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);
        return http.build();
    }

    static class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {
        private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Supplier<CsrfToken> csrfToken) {
            /*
             * Always use XorCsrfTokenRequestAttributeHandler to provide BREACH protection of
             * the CsrfToken when it is rendered in the response body.
             */
            this.delegate.handle(request, response, csrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            if (StringUtils.hasText(request.getHeader(csrfToken.getHeaderName()))) {
                return super.resolveCsrfTokenValue(request, csrfToken);
            }
            return this.delegate.resolveCsrfTokenValue(request, csrfToken);
        }
    }

    static class CsrfCookieFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
            // Render the token value to a cookie by causing the deferred token to be loaded
            csrfToken.getToken();

            filterChain.doFilter(request, response);
        }
    }
}
