package io.hawt.tests.openshift.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.extension.ExtendWith;

import com.codeborne.selenide.Selenide;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.hooks.DeployAppHook;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
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
        Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
            .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
    }
}
