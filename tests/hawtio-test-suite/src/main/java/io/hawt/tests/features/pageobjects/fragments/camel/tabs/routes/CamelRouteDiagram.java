package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Selenide.$$;

import org.assertj.core.api.Assertions;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import java.awt.Rectangle;
import java.util.HashSet;
import java.util.Set;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Route Diagram Tab page in Camel.
 */
public class CamelRouteDiagram extends CamelPage {
    final private static ElementsCollection nodes = $$("[data-testid^='rf__node-']");

    /**
     * Check that routes diagram is present on this page.
     */
    public void diagramIsPresent() {
        $$(".camel-node-content").shouldHave(CollectionCondition.sizeGreaterThan(1));
    }

    /**
     * Check that route nodes do not overlay/intersect.
     */
    public void nodesDoNotOverlay() {
        for (int i = 0; i < nodes.size(); i++) {
            Rectangle rect1 = toAwtRectangle(nodes.get(i).getRect());
            String id1 = nodes.get(i).getAttribute("data-testid");

            for (int j = i + 1; j < nodes.size(); j++) {
                Rectangle rect2 = toAwtRectangle(nodes.get(j).getRect());
                String id2 = nodes.get(j).getAttribute("data-testid");

                Assertions.assertThat(rect1.intersects(rect2))
                    .as("Node %s at %s overlaps with node %s at %s", id1, rect1, id2, rect2)
                    .isFalse();
            }
        }
    }

    /**
     * Check that there are no duplications.
     */
    public void noNodeDuplicationsExist() {
        Set<String> routeNodes = new HashSet<>();
        for (SelenideElement node : nodes) {
            Rectangle rect = toAwtRectangle(node.getRect());

            String routeNode = String.format("%s|%d,%d,%d,%d",
                node.getAttribute("data-testid"), rect.x, rect.y, rect.width, rect.height);

            Assertions.assertThat(routeNodes.add(routeNode))
                .as("Duplicate node found: %s", routeNode)
                .isTrue();
        }
    }

    /**
     * Convert Selenium Rectangle to java awt Rectangle.
     *
     * @param seleniumRect Selenium Rectangle
     * @return java awt Rectangle
     */
    private Rectangle toAwtRectangle(org.openqa.selenium.Rectangle seleniumRect) {
        return new Rectangle(
            seleniumRect.getX(),
            seleniumRect.getY(),
            seleniumRect.getWidth(),
            seleniumRect.getHeight()
        );
    }
}
