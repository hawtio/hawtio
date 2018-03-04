package io.hawt.springboot;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.HashMap;
import java.util.Map;

import org.junit.ClassRule;
import org.junit.Rule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.rules.SpringClassRule;
import org.springframework.test.context.junit4.rules.SpringMethodRule;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(classes = HawtioAutoConfiguration.class, webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ContextConfiguration(initializers = AbstractMvcIT.TestPropertiesContextInitializer.class)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
public abstract class AbstractMvcIT {

    public static final ThreadLocal<Map<String, Object>> PROPERTIES =
        ThreadLocal.withInitial(() -> new HashMap<>());

    protected static void clearProperties() {
        PROPERTIES.get().clear();
    }

    protected static void setProperty(final String name, final Object value) {
        if (value != null) {
            PROPERTIES.get().put(name, value.toString());
        }
    }

    protected static int findFreePort() {
        ServerSocket socket = null;
        try {
            socket = new ServerSocket(0);
            socket.setReuseAddress(true);
            int port = socket.getLocalPort();
            closeSocket(socket);
            return port;
        } catch (final IOException ex) {
            // ignore
        } finally {
            if (socket != null) {
                closeSocket(socket);
            }
        }

        throw new IllegalStateException("Unable to locate a free TCP/IP port");
    }

    private static void closeSocket(final ServerSocket socket) {
        try {
            socket.close();
        } catch (IOException e) {
            // Ignore IOException on close()
        }
    }

    @ClassRule
    public static final SpringClassRule SPRING_CLASS_RULE = new SpringClassRule();

    @Rule
    public final SpringMethodRule springMethodRule = new SpringMethodRule();

    @Autowired
    protected MockMvc mockMvc;

    protected AbstractMvcIT() {
        clearProperties();
    }

    public static class TestPropertiesContextInitializer implements
        ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(
            final ConfigurableApplicationContext applicationContext) {
            applicationContext.getEnvironment().getPropertySources()
                .addFirst(new MapPropertySource("MvcIT", PROPERTIES.get()));
        }
    }
}
