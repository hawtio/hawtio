package io.hawt.tests.features.pageobjects.fragments.online;

import static com.codeborne.selenide.Selenide.$;

import org.apache.commons.lang3.StringUtils;
import org.assertj.core.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.pageobjects.fragments.openshift.DeploymentEntry;
import io.hawt.tests.features.pageobjects.fragments.openshift.PodEntry;
import io.hawt.tests.features.utils.ByUtils;

public class DiscoverTab {

    private static final By SEARCH_INPUT = By.cssSelector("#search-filter-input input[type=\"text\"]");
    private static final By SEARCH_DROPDOWN_BUTTON = By.cssSelector("button[aria-label=\"Options menu\"]");
    private static final By DISCOVER_TABS = By.className("pf-v6-c-tabs__list");

    public static final boolean REPLICA_SET_WORKAROUND = true;
    public static final By ACTIVE_DEPLOYMENT_LIST = By.cssSelector(".pf-v6-c-tab-content:not([hidden])");

    public void connectTo(String name) {
        waitForPageLoaded();
        new PodEntry($(ByUtils.byExactText(name)).ancestor("li")).connect();
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
        $(By.id("select-filter-type")).$(ByUtils.byExactText("button", StringUtils.capitalize(type))).click();
    }

    public void searchByNamespace(String namespace) {
        selectSearchMode("Namespace");
        search(namespace);
    }

    public Map<String, DeploymentEntry> getDeployments() {
        waitForPageLoaded();
        return $(ACTIVE_DEPLOYMENT_LIST).$$(By.tagName("dt")).asFixedIterable().stream().map(DeploymentEntry::new)
            .collect(Collectors.toMap(DeploymentEntry::getName, d -> d));
    }

    public List<PodEntry> getAllPods() {
        waitForPageLoaded();
        return getDeployments().values().stream().map(DeploymentEntry::getPods).flatMap(Collection::stream).collect(Collectors.toList());
    }

    public void selectNamespace(String namespace) {
        final SelenideElement namespaceTab = $(DISCOVER_TABS).$(ByUtils.byPartialText(namespace));
        namespaceTab.should(Condition.exist, Duration.ofMinutes(1));
        if (namespaceTab.is(Condition.interactable)) {
            namespaceTab.click();
        }
    }

    public DeploymentEntry assertContainsDeployment(String name, String namespace) {
        selectNamespace(namespace);
        final Map<String, DeploymentEntry> deployments = getDeployments();
        if (REPLICA_SET_WORKAROUND) {
            final List<DeploymentEntry> matchingEntries = deployments.entrySet().stream()
                .filter(entry -> {
                    if (!entry.getKey().startsWith(name)) {
                        return false;
                    }

                    List<PodEntry> pods = entry.getValue().getPods();
                    if (pods == null || pods.isEmpty()) {
                        return false;
                    }

                    return pods.get(0).getNamespace().equals(namespace);
                })
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());

            Assertions.assertThat(matchingEntries).hasSize(1);
            return matchingEntries.get(0);
        } else {
            Assertions.assertThat(deployments).containsKey(name);
            return deployments.get(name);
        }
    }

    public DeploymentEntry assertContainsDeployment(String name) {
        return assertContainsDeployment(name, TestConfiguration.getOpenshiftNamespace());
    }

    private void waitForPageLoaded() {
        $(ByUtils.byDataTestId("loading")).shouldNot(Condition.exist, Duration.ofSeconds(30));
        $(ACTIVE_DEPLOYMENT_LIST).should(Condition.exist, Duration.ofSeconds(30));
    }
}
