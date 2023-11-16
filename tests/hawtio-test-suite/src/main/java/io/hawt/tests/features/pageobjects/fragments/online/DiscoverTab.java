package io.hawt.tests.features.pageobjects.fragments.online;

import static com.codeborne.selenide.Selenide.$;

import org.apache.commons.lang3.StringUtils;
import org.assertj.core.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import io.hawt.tests.features.pageobjects.fragments.openshift.DeploymentEntry;
import io.hawt.tests.features.pageobjects.fragments.openshift.PodEntry;
import io.hawt.tests.features.utils.ByUtils;

public class DiscoverTab {

    private static final By SEARCH_INPUT = By.cssSelector("#search-filter-input input[type=\"text\"]");
    private static final By SEARCH_DROPDOWN_BUTTON = By.cssSelector("button[aria-label=\"Options menu\"]");

    public static final boolean REPLICA_SET_WORKAROUND = true;

    public void connectTo(String name) {
        waitForPageLoaded();
        new PodEntry($(ByUtils.byText("a", name)).ancestor("li")).connect();
        Selenide.switchTo().window(1);
    }

    public void searchByName(String name) {
        selectSearchMode("Name");
        search(name);
    }

    private void search(String value) {
        $(SEARCH_INPUT).sendKeys(value);
        $(SEARCH_INPUT).sendKeys(Keys.ENTER);
    }

    private void selectSearchMode(String type) {
        waitForPageLoaded();
        if ($(SEARCH_DROPDOWN_BUTTON).innerText().trim().equalsIgnoreCase(type)) {
            return;
        }
        $(SEARCH_DROPDOWN_BUTTON).click();
        $(By.id("select-filter-type")).$(ByUtils.byText("button", StringUtils.capitalize(type))).click();
    }

    public void searchByNamespace(String namespace) {
        selectSearchMode("Namespace");
        search(namespace);
    }

    public Map<String, DeploymentEntry> getDeployments() {
        waitForPageLoaded();
        return $(By.className("pf-c-accordion")).$$(By.tagName("dt")).asFixedIterable().stream().map(DeploymentEntry::new)
            .collect(Collectors.toMap(DeploymentEntry::getName, d -> d));
    }

    public List<PodEntry> getAllPods() {
        waitForPageLoaded();
        return getDeployments().values().stream().map(DeploymentEntry::getPods).flatMap(Collection::stream).collect(Collectors.toList());
    }

    public DeploymentEntry assertContainsDeployment(String name) {
        final Map<String, DeploymentEntry> deployments = getDeployments();
        if (REPLICA_SET_WORKAROUND) {
            final List<String> matchingKeys = deployments.keySet().stream().filter(key -> key.startsWith(name)).collect(Collectors.toList());
            Assertions.assertThat(matchingKeys).hasSize(1);
            return deployments.get(matchingKeys.get(0));
        } else {
            Assertions.assertThat(deployments).containsKey(name);
            return deployments.get(name);
        }
    }

    private void waitForPageLoaded() {
        $(ByUtils.byDataTestId("loading")).shouldNot(Condition.exist, Duration.ofSeconds(30));
    }
}
