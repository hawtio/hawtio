package io.hawt.tests.features.setup.deployment;

import static org.assertj.core.api.Assertions.assertThat;

import org.apache.commons.io.IOUtils;
import org.awaitility.Awaitility;
import org.awaitility.core.ConditionTimeoutException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Properties;

import io.hawt.tests.features.config.TestConfiguration;

public class MavenDeployment implements AppDeployment {

    private static final String DEFAULT_PORT = "8080";

    private final String path;

    private String port;
    private File logFile;

    private Process process;

    public MavenDeployment(String path) {
        this.path = path;
    }

    @Override
    public void start() {
        List<String> cmd = new ArrayList<>();

        cmd.add(System.getProperty("java.home") + "/bin/java");
        cmd.add("-jar");

        final Path path = Path.of(this.path);
        final File file = path.toFile();
        assertThat(file).exists();
        if (file.isDirectory()) {
            final File classesFolder = path.resolve("classes").resolve("application.properties").toFile();

            final Properties properties = new Properties();
            try {
                properties.load(new FileInputStream(classesFolder));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            //find quarkus or springboot app and run
            if (TestConfiguration.isSpringboot()) {
                final Optional<String> jarName =
                    Arrays.stream(file.list()).filter(it -> it.endsWith(".jar")).filter(it -> !it.contains("sources")).findFirst();
                assertThat(jarName).describedAs("Expecting Springboot WAR to exist").isPresent();

                cmd.add(Path.of(file.getAbsolutePath(), jarName.get()).toString());

                port = properties.getProperty("management.server.port", properties.getProperty("server.port", DEFAULT_PORT));
            } else if (TestConfiguration.isQuarkus()) {
                final Path quarkusFolder = path.resolve("quarkus-app");
                assertThat(quarkusFolder).exists();
                final Path quarkusRun = quarkusFolder.resolve("quarkus-run.jar");
                assertThat(quarkusRun).describedAs("Expecting quarkus-run.jar to exist").exists();

                cmd.add(quarkusRun.toString());

                port = properties.getProperty("quarkus.http.port", DEFAULT_PORT);
            } else {
                throw new RuntimeException("Invalid runtime chosen");
            }
        } else {
            assertThat(file.getName()).endsWith(".jar");
            cmd.add(file.getAbsolutePath());
        }

        try {
            logFile = new File("target", "hawtio-app.log");
            process = new ProcessBuilder(cmd).redirectOutput(logFile).redirectErrorStream(true).start();
            assertThat(process.isAlive()).isTrue();
            waitForAppRunning();
        } catch (IOException | ConditionTimeoutException e) {
            throw new RuntimeException(e);
        }
    }

    private void waitForAppRunning() {
        final String needle = TestConfiguration.isSpringboot() ? "Started SpringBootService" : "(SampleCamel) started";
        Awaitility.await().pollInSameThread().atMost(Duration.ofSeconds(10)).pollInterval(Duration.ofMillis(500)).until(() -> {
            final String logs = IOUtils.toString(logFile.toURI(), Charset.defaultCharset());
            return logs.contains(needle);
        });
    }

    @Override
    public void stop() {
        if (process != null && process.isAlive()) {
            process.destroy();
        }
    }

    @Override
    public String getURL() {
        return "http://localhost:" + port;
    }
}
