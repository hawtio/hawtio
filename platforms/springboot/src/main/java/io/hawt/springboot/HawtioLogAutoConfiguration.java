package io.hawt.springboot;

import io.hawt.log.logback.LogbackLogQuery;
import io.hawt.log.support.LogQuerySupport;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Autoconfiguration for Hawtio Log plugin. It is registered in "main" application context, because it doesn't
 * use web stuff, but only registers relevant MBeans.
 */
@AutoConfiguration
@ConditionalOnClass(LogQuerySupport.class)
public class HawtioLogAutoConfiguration {

    /**
     * Nested {@link Configuration} class for specific {@link LogQuerySupport} implementation. It is
     * defined in different library, so we can't have a {@link Bean} method returning an instance and at
     * the same time use {@link ConditionalOnClass} on the very same class.
     */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(LogbackLogQuery.class)
    public static class LogbackConfiguration {

        @Bean
        @ConditionalOnMissingBean
        public LogbackLogQuery logbackLogQuery() {
            LogbackLogQuery logQuery = new LogbackLogQuery();
            logQuery.start();
            return logQuery;
        }

    }

}
