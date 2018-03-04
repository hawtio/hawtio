package io.hawt.springboot;

import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.ManagementServerProperties;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;

@RunWith(Enclosed.class)
public abstract class HawtioConfigurationIT {

    @RunWith(SpringRunner.class)
    @ContextConfiguration(classes = { HawtioAutoConfiguration.class,
            HawtioConfiguration.class,
            HawtioConfigurationIT.TestConfiguration.class })
    public static abstract class TestBase {

        @Autowired
        protected ApplicationContext ctx;
    }

    @RunWith(SpringRunner.class)
    public static class NonWebApplicationTest extends TestBase {

        @Test(expected = NoSuchBeanDefinitionException.class)
        public void testConfigurationIsNotLoaded() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @WebAppConfiguration
    public static class HawtioIsEnabledByDefaultTest extends TestBase {
        @Autowired
        protected ApplicationContext ctx;

        @Test
        public void testConfigurationIsLoaded() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @WebAppConfiguration
    @TestPropertySource(properties = "endpoints.enabled=false")
    public static class HawtioIsDisabledWhenEndpointsAreDisabledTest
            extends TestBase {

        @Test(expected = NoSuchBeanDefinitionException.class)
        public void testConfigurationIsNotLoaded() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @WebAppConfiguration
    @TestPropertySource(properties = "endpoints.hawtio.enabled=false")
    public static class HawtioEndpointIsDisabledTest extends TestBase {

        @Test(expected = NoSuchBeanDefinitionException.class)
        public void test() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @WebAppConfiguration
    @TestPropertySource(properties = { "endpoints.enabled=false",
            "endpoints.hawtio.enabled=true" })
    public static class HawtioEndpointIsEnabledWhileOtherEndpointsAreDisabledTest
            extends TestBase {

        @Test
        public void test() {
            ctx.getBean(HawtioConfiguration.class);
        }
    }

    @Configuration
    public static class TestConfiguration {

        @Bean
        public ManagementServerProperties managementProperties() {
            return new ManagementServerProperties();
        }

        @Bean
        public ServerProperties serverProperties() {
            return new ServerProperties();
        }
    }

}
