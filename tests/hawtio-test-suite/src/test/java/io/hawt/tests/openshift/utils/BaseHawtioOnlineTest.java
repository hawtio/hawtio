package io.hawt.tests.openshift.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.extension.ExtendWith;

import org.openqa.selenium.NoSuchWindowException;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.hooks.DeployAppHook;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
import io.hawt.tests.features.setup.WebDriver;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;

@OpenshiftTest
@ExtendWith(SelenideTestWatcher.class)
public class BaseHawtioOnlineTest {

    private static OpenshiftDeployment openshiftDeployment;

    @BeforeAll
    public static void ensureHawtioOnlineSetup() {
        assertThat(TestConfiguration.getAppDeploymentMethod()).isInstanceOf(OpenshiftDeployment.class);
        openshiftDeployment = (OpenshiftDeployment) TestConfiguration.getAppDeploymentMethod();
        DeployAppHook.appSetup();
        openshiftDeployment.restartApp();
        WebDriver.setup();
        Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
            .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
    }

    @AfterEach
    public void openBrowser() {
        try {
            while (WebDriverRunner.getWebDriver().getWindowHandles().size() > 1) {
                Selenide.closeWindow();
                Selenide.switchTo().window(0);
            }
            Selenide.refresh();
            Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
                .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
        } catch (NoSuchWindowException e) {
            Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
                .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
        }
    }
}
