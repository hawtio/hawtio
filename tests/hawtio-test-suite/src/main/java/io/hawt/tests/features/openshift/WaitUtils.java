package io.hawt.tests.features.openshift;

import org.junit.function.ThrowingRunnable;
import org.junit.jupiter.api.function.ThrowingSupplier;

import org.assertj.core.api.ThrowableAssert;
import org.awaitility.Awaitility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.function.Consumer;
import java.util.function.Supplier;

public class WaitUtils {

    private static final Logger LOG = LoggerFactory.getLogger(WaitUtils.class);
    public static void waitFor(Callable<Boolean> o, String s) {
        waitFor(o, s,Duration.ofSeconds(5));
    }

    public static void waitFor(Callable<Boolean> o, String s, Duration duration) {
        LOG.info(s);

        Awaitility.await().pollInSameThread().atMost(duration).ignoreExceptions().until(o);
    }

    public static void untilAsserted(org.awaitility.core.ThrowingRunnable runnable, Duration duration) {
        Awaitility.await().pollInSameThread().atMost(duration).untilAsserted(runnable);
    }

    public static void waitForPageLoad() {
        waitFor(() -> {
            return Selenide.executeJavaScript("return document.readyState").equals("complete");
        }, "Waiting for page to finish loading", Duration.ofSeconds(20));
    }

    public static void withRetry(ThrowingRunnable runnable, int retries, Duration interval) {
        Throwable lastThrowable = null;
        for (int i = 0; i < retries; i++) {
            try {
                runnable.run();
                return;
            } catch (Throwable t) {
                lastThrowable = t;
                LOG.info("Ignoring exception {}, {} retries remaining", t.toString(), retries - i);
                wait(interval);
            }
        }
        throw new RuntimeException("Throwable run after " + retries + " retries", lastThrowable);
    }

    public static <T> T withRetry(ThrowingSupplier<T> supplier, int retries, Duration interval) {
        Throwable lastThrowable = null;
        for (int i = 0; i < retries; i++) {
            try {
                return supplier.get();
            } catch (Throwable t) {
                lastThrowable = t;
                LOG.info("Ignoring exception {}, {} retries remaining", t.toString(), retries - i);
                wait(interval);
            }
        }
        throw new RuntimeException("Throwable run after " + retries + " retries", lastThrowable);
    }

    public static void wait(Duration duration) {
        try {
            Thread.sleep(duration.toMillis());
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
