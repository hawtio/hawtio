package io.hawt.tests.features.pageobjects.fragments.openshift;

import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import java.util.List;
import java.util.stream.Collectors;

public class DeploymentEntry {

    public static final By CONSOLE_LINK = By.className("console-link");

    private final SelenideElement root;

    public DeploymentEntry(SelenideElement root) {
        this.root = root;
    }

    public String getName() {
        return $(root).$(CONSOLE_LINK).innerText();
    }

    public String getDeploymentURL() {
        return $(root).$(CONSOLE_LINK).attr("href");
    }

    public void toggleExpand() {
        $(root).$(By.className("pf-v5-c-accordion__toggle")).click();
    }

    public List<PodEntry> getPods() {
        return $(root).sibling(0).$(By.className("pf-v5-c-list")).$$(By.cssSelector("li.pod-item-list-item")).asFixedIterable().stream().map(PodEntry::new).collect(Collectors.toList());
    }
}
