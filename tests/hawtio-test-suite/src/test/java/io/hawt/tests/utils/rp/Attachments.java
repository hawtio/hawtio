package io.hawt.tests.utils.rp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class Attachments {

    private static final Logger LOG = LoggerFactory.getLogger(Attachments.class);
    private static final List<Path> testClassAttachments = new ArrayList<>();
    private static final List<Path> testCaseAttachments = new ArrayList<>();
    private static String currentTestCase;
    private static String currentTestClass;

    private Attachments() {
    }

    static void startTestClass(String testClass) {
        currentTestClass = testClass;
    }

    static void startTestCase(String testCase) {
        currentTestCase = testCase;
    }

    static void endTestCase(boolean failure) {
        if (failure) {
            createAttachments(Stream.concat(testClassAttachments.stream(), testCaseAttachments.stream()).collect(Collectors.toList()),
                currentTestClass + "." + currentTestCase);
        }
        testCaseAttachments.clear();
        currentTestCase = null;
    }

    static void endTestClass() {
        testClassAttachments.clear();
        currentTestClass = null;
    }

    private static void createAttachments(List<Path> attachments, String folder) {
        if (attachments.isEmpty()) {
            return;
        }

        try {
            final Path testCaseDir = Path.of("target", "attachments", folder);
            Files.createDirectories(testCaseDir);

            for (Path p : attachments) {
                Files.copy(p, testCaseDir.resolve(p.getFileName()));
            }
        } catch (IOException e) {
            LOG.error("Couldn't create an attachment for test case {}#{}", currentTestClass, currentTestCase, e);
        }
    }

    public static void addAttachment(Path path) {
        LOG.info("Adding attachment: {}", path);
        if (currentTestCase != null) {
            testCaseAttachments.add(path);
        } else {
            testClassAttachments.add(path);
        }
    }
}

