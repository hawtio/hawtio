package io.hawt.tests.features.pageobjects.fragments.openshift;

import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selenide.$;

import org.apache.commons.lang3.NotImplementedException;
import org.jetbrains.annotations.NotNull;
import org.openqa.selenium.By;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;

import java.util.Map;
import java.util.stream.Collectors;

import io.hawt.tests.features.utils.ByUtils;

public class PodEntry {

    private final SelenideElement root;

    public PodEntry(SelenideElement root) {
        this.root = root;
    }

    @NotNull
    private SelenideElement getPodElement() {
        return $(root).$(DeploymentEntry.CONSOLE_LINK);
    }

    public String getName() {
        return getPodElement().innerText();
    }

    public String getPodURL() {
        return getPodElement().attr("href");
    }

    @NotNull
    private SelenideElement getNamespacePill() {
        return $(root).$(By.className("pod-item-home"));
    }

    public String getNamespace() {
        return getNamespacePill().innerText();
    }

    public String getNamespaceURL() {
        return getNamespacePill().$(By.tagName("a")).attr("href");
    }

    //TODO: add selectors to the worker pills
    public String getWorker() {
        throw new NotImplementedException("A selector needs to be added into the UI");
    }

    public String getWorkerURL() {
        throw new NotImplementedException("A selector needs to be added into the UI");
    }

    private int getNumFromLabel(String label) {
        return Integer.parseInt($(root).$(By.className("pod-item-" + label)).innerText().split(" ")[0]);
    }

    private String getContainerRatioText() {
        return $(root).$(By.className("pod-item-containers")).innerText().split(" ")[0];
    }

    public int getReadyContainerCount() {
        return Integer.parseInt(getContainerRatioText().split("/")[0].trim());
    }

    public int getTotalContainerCount() {
        return Integer.parseInt(getContainerRatioText().split("/")[1].trim());
    }

    public int getContainerCount() {
        return getNumFromLabel("containers");
    }

    public int getRouteCount() {
        return getNumFromLabel("routes");
    }

    public Map<String, String> getLabels() {
        return $(root).$(By.className("pod-item-name-with-labels")).$(ByUtils.byLabel("ul", "Label group category")).$$(By.tagName("li"))
            .asFixedIterable()
            .stream()
            .collect(Collectors.toMap(
                el -> el.$(By.className("k8s-label-key")).innerText(),
                el -> el.$(By.className("k8s-label-value")).innerText()
            ));
    }

    public void clickOnLabel(String name) {
        $(root).$(By.className("pod-item-name-with-labels"))
            .$(ByUtils.byLabel("ul", "Label group category"))
            .$$(By.className("k8s-label-key"))
            .find(Condition.text(name))
            .click();
    }

    public String getStatus() {
        return $(root).$(By.cssSelector("span.state-text")).innerText();
    }

    public void connect() {
        $(root).$(By.cssSelector(".pod-item-connect-button > button")).shouldBe(interactable).click();
    }
}
