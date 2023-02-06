package io.hawt.tests.utils.setup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;

public class WebDriver {
    private static final Logger LOG = LoggerFactory.getLogger(WebDriver.class);

    private WebDriver() {

    }

    public static void setup() {

        LOG.info("Setting up a web browser options");
        System.setProperty("hawtio.proxyWhitelist", "localhost, 127.0.0.1");
        Configuration.headless = true;
        Configuration.browserSize = "1920x1080";
        Configuration.timeout = 20000;
    }

    public static void clear() {
        LOG.info("Clear browser cookies and local storage");
        Selenide.clearBrowserCookies();
        Selenide.clearBrowserLocalStorage();
        Selenide.closeWindow();
    }
}
