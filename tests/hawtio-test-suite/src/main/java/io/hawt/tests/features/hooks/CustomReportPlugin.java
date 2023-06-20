package io.hawt.tests.features.hooks;

import org.apache.commons.lang3.StringUtils;
import org.openqa.selenium.logging.LogType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;

import java.util.List;

import io.cucumber.java.BeforeStep;
import io.cucumber.java.Scenario;
import io.cucumber.plugin.ConcurrentEventListener;
import io.cucumber.plugin.event.EventPublisher;
import io.cucumber.plugin.event.TestStepFinished;

public class CustomReportPlugin implements ConcurrentEventListener {

    private static final Logger LOG = LoggerFactory.getLogger(CustomReportPlugin.class);

    private static EventPublisher eventPublisher;
    private static Scenario currentScenario;

    @Override
    public void setEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;

        eventPublisher.registerHandlerFor(TestStepFinished.class, this::screenshotHook);
    }

    @BeforeStep
    public static void catchScenario(Scenario scenario) {
        currentScenario = scenario;
    }

    private void screenshotHook(TestStepFinished event) {
        if (!event.getResult().getStatus().isOk()) {
            String[] logTypes = new String[] {LogType.BROWSER, LogType.CLIENT, LogType.DRIVER};
            for (String logType : logTypes) {
                List<String> logs = Selenide.getWebDriverLogs(logType);
                LOG.info(StringUtils.repeat("=", 20));
                LOG.info("browser {} logs", logType);
                LOG.info("{}", logs);
                LOG.info(StringUtils.repeat("=", 20));
                if (currentScenario != null) {
                    currentScenario.attach(String.valueOf(logs), "text/plain", "Browser " + logType + " logs");
                }
            }
        }
    }
}

