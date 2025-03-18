package io.hawt.tests.features.setup.deployment;

import static org.assertj.core.api.Assertions.assertThat;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.awaitility.Awaitility;
import org.awaitility.core.ConditionTimeoutException;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Properties;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.utils.TestUtils;

public class MavenDeployment implements AppDeployment {

    private static final String DEFAULT_PORT = "8080";

    private static final String QUARKUS_KEYCLOAK_FILE = ".quarkus-uses-keycloak";

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
            TestUtils.tryOrRuntimeException(() -> properties.load(new FileInputStream(classesFolder)), "Failed to load properties");

            if (TestConfiguration.useKeycloak()) {
                KeycloakDeployment.start();
            }

            //find quarkus or springboot app and run
            if (TestConfiguration.isSpringboot()) {
                final Optional<String> jarName =
                    Arrays.stream(file.list()).filter(it -> it.endsWith(".jar")).filter(it -> !it.contains("sources")).findFirst();
                assertThat(jarName).describedAs("Expecting Springboot JAR to exist").isPresent();

                final Path jarPath = Path.of(file.getAbsolutePath(), jarName.get());
                cmd.add(jarPath.toString());

                port = properties.getProperty("management.server.port", properties.getProperty("server.port", DEFAULT_PORT));
                if (TestConfiguration.useKeycloak()) {
                    modifyKeycloakJsonFile(jarPath);
                    cmd.add("--spring.profiles.active=keycloak");
                    cmd.add("--keycloak-url=" + KeycloakDeployment.getIssuerURL());
                }
            } else if (TestConfiguration.isQuarkus()) {
                final Path quarkusFolder = path.resolve("quarkus-app");
                assertThat(quarkusFolder).exists();
                final Path quarkusRun = quarkusFolder.resolve("quarkus-run.jar");
                assertThat(quarkusRun).describedAs("Expecting quarkus-run.jar to exist").exists();

                cmd.add(quarkusRun.toString());

                port = properties.getProperty("quarkus.http.port", DEFAULT_PORT);

                boolean quarkusUsesKeycloak = quarkusFolder.resolve(QUARKUS_KEYCLOAK_FILE).toFile().exists();

                if (TestConfiguration.useKeycloak()) {
                    if (!quarkusUsesKeycloak) {
                        List<String> rebuildCmd = new ArrayList<>(cmd);
                        rebuildCmd.add(1, "-Dquarkus.launch.rebuild=true");
                        rebuildCmd.add(1, "-Dquarkus.profile=keycloak");

                        TestUtils.runCmd(rebuildCmd, new File("target", "rebuild.log"));

                        TestUtils.tryOrRuntimeException(() -> FileUtils.write(quarkusFolder.resolve(QUARKUS_KEYCLOAK_FILE).toFile(), "", Charset.defaultCharset()), "Failed to create a file");
                    }
                    final Path appFolder = quarkusFolder.resolve("app");

                    modifyKeycloakJsonFile(appFolder.resolve(appFolder.toFile().list()[0]));
                    cmd.add(1, "-Dquarkus.oidc.auth-server-url=" + KeycloakDeployment.getIssuerURL());
                } else {
                    if (quarkusUsesKeycloak) {
                        List<String> rebuildCmd = new ArrayList<>(cmd);
                        rebuildCmd.add(1, "-Dquarkus.launch.rebuild=true");
                        TestUtils.runCmd(rebuildCmd, new File("target", "rebuild.log"));
                        TestUtils.tryOrRuntimeException(() -> FileUtils.delete(quarkusFolder.resolve(QUARKUS_KEYCLOAK_FILE).toFile()), "Failed to delete a file");
                    }
                }
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

    private void modifyKeycloakJsonFile(Path jarPath) {
        try (FileSystem fs = FileSystems.newFileSystem(jarPath, (ClassLoader) null)) {
            Path keycloakFile;
            if (TestConfiguration.isQuarkus()) {
                keycloakFile = fs.getPath("keycloak-hawtio.json");
            } else {
                keycloakFile = fs.getPath("BOOT-INF", "classes", "keycloak-hawtio.json");
            }
            String content = Files.readString(keycloakFile);

            final JsonElement json = JsonParser.parseString(content);
            json.getAsJsonObject().addProperty("url", KeycloakDeployment.getURL());
            Files.writeString(keycloakFile, json.toString(), StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void waitForAppRunning() {
        final String needle = TestConfiguration.getNeedleForLogs();
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
