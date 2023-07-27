package io.hawt.springboot;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;

import org.junit.Test;
import org.mockito.Mockito;

import io.hawt.system.ConfigManager;

public class SpringHawtioContextListenerTest {

    @Test
    public void testContextInitialized() {
        final ConfigManager configManager = Mockito.mock(ConfigManager.class);
        final ServletContextEvent event = Mockito.mock(ServletContextEvent.class);
        final ServletContext ctx = Mockito.mock(ServletContext.class);

        Mockito.when(event.getServletContext()).thenReturn(ctx);

        final SpringHawtioContextListener underTest = new SpringHawtioContextListener(
            configManager, "foobar");
        underTest.contextInitialized(event);

        Mockito.verify(configManager).init();
        Mockito.verify(ctx).setAttribute("ConfigManager", configManager);
        Mockito.verify(ctx).setAttribute("hawtioServletPath", "foobar");
    }

}
