package io.hawt.springboot;

import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.ManagementServerProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(Enclosed.class)
@ContextConfiguration(classes = { HawtioConfiguration.class, HawtioConfigurationTest.TestConfiguration.class })
public abstract class HawtioConfigurationTest {

    @Autowired
    protected ApplicationContext ctx;

    @RunWith(SpringRunner.class)
    public static class HawtioEnabledByDefaultTest extends HawtioConfigurationTest {

        @Test
        public void test() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @RunWith(SpringRunner.class)
    @TestPropertySource(properties = "hawtio.enabled=false")
    public static class HawtioCanBeDisabledTest extends HawtioConfigurationTest {

        @Test(expected = NoSuchBeanDefinitionException.class)
        public void test() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @Configuration
    public static class TestConfiguration {

        @Bean
        public ManagementServerProperties serverProperties() {
            return Mockito.mock(ManagementServerProperties.class);
        }
    }
}
