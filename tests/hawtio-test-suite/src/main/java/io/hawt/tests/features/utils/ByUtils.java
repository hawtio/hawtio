package io.hawt.tests.features.utils;

import org.openqa.selenium.By;

import com.codeborne.selenide.selector.ByTagAndText;
import com.codeborne.selenide.selector.ByText;

public class ByUtils {

    public static By byText(String text) {
        return new ByText(text);
    }

    public static By byText(String tag, String text) {
        return new ByTagAndText(tag, text);
    }

    public static By byLabel(String text) {
        return byAttribute("aria-label", text);
    }

    public static By byLabel(String tag, String text) {
        return byAttribute(tag, "aria-label", text);
    }

    public static By byAttribute(String attribute, String text) {
        return By.cssSelector("[" + attribute + "=\"" + text + "\"]");
    }

    public static By byAttribute(String tag, String attribute, String text) {
        return By.cssSelector(tag + "[" + attribute + "=\"" + text + "\"]");
    }


    public static By byDataTestId(String value) {
        return byAttribute("data-testid", value);
    }

    public static By byDataTestId(String tag, String value) {
        return byAttribute(tag, "data-testid", value);
    }

}
