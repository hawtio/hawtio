package io.hawt.tests.features.setup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;

public class WebDriver {
    private static final Logger LOG = LoggerFactory.getLogger(WebDriver.class);

    /**
     * Set up a web driver.
     */
    public static void setup() {
        LOG.info("Setting up a web browser options");
        System.setProperty("hawtio.proxyWhitelist", "localhost, 127.0.0.1");
        Configuration.headless = true;
        Configuration.browserSize = "1920x1080";
        Configuration.timeout = 20000;
    }

    /**
     * Clear cache, cookies, local storage after the tests are run.
     */
    public static void clear() {
        LOG.info("Clear browser cookies and local storage");
        Selenide.clearBrowserCookies();
        Selenide.clearBrowserLocalStorage();
        Selenide.closeWindow();
    }
}
