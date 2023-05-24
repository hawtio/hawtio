package io.hawt.tests.features.stepdefinitions.plugin;

import io.cucumber.java.en.Then;
import io.hawt.tests.features.pageobjects.pages.plugin.PluginPage;

public class PluginStepDefs {
    private final PluginPage pluginPage = new PluginPage();

    @Then("^Content section has h1 title \"([^\"]*)\"$")
    public void contentSectionHasH1Title(String title) {
        pluginPage.checkTitle(title);
    }

    @Then("^Content section has paragraph \"([^\"]*)\"$")
    public void contentSectionHasParagraph(String content) {
        pluginPage.checkContentParagraph(content);
    }
}
