package io.hawt.tests.features.utils;

import org.junit.function.ThrowingRunnable;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class TestUtils {
    public static void runCmd(List<String> cmd, File outputLog) {
        try {
            Process rebuildProcess =
                new ProcessBuilder(cmd).redirectOutput(outputLog).redirectErrorStream(true).start();
            int ret = rebuildProcess.waitFor();
            if (ret != 0) {
                throw new RuntimeException("Quarkus app failed to rebuild");
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public static void tryOrRuntimeException(ThrowingRunnable runnable, String message) {
        try {
            runnable.run();
        } catch (Throwable e) {
            throw new RuntimeException(message, e);
        }
    }
}
