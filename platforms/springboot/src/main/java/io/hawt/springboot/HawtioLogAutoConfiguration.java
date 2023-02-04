package io.hawt.springboot;

import io.hawt.log.logback.LogbackLogQuery;
import io.hawt.log.support.LogQuerySupport;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

/**
 * Autoconfiguration for Hawtio Log.
 */
@AutoConfiguration
@ConditionalOnClass(LogQuerySupport.class)
public class HawtioLogAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnClass(LogbackLogQuery.class)
    public LogbackLogQuery logbackLogQuery() {
        LogbackLogQuery logQuery = new LogbackLogQuery();
        logQuery.start();
        return logQuery;
    }

}
