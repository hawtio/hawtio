package io.hawt.springboot;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.junit.jupiter.api.Test;

import org.mockito.MockMakers;
import org.mockito.Mockito;

import io.hawt.system.ConfigManager;

import static org.mockito.Mockito.withSettings;

public class SpringHawtioContextListenerTest {

    @Test
    public void testContextInitialized() {
        final ConfigManager configManager = Mockito.mock(ConfigManager.class, withSettings().mockMaker(MockMakers.SUBCLASS));
        final ServletContextEvent event = Mockito.mock(ServletContextEvent.class, withSettings().mockMaker(MockMakers.SUBCLASS));
        final ServletContext ctx = Mockito.mock(ServletContext.class, withSettings().mockMaker(MockMakers.SUBCLASS));

        Mockito.when(event.getServletContext()).thenReturn(ctx);

        final SpringHawtioContextListener underTest = new SpringHawtioContextListener(
            configManager, "foobar");
        underTest.contextInitialized(event);

        Mockito.verify(ctx).setAttribute("ConfigManager", configManager);
        Mockito.verify(ctx).setAttribute("hawtioServletPath", "foobar");
    }

}
