package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Selenide.$$;

import org.assertj.core.api.Assertions;
import org.openqa.selenium.Rectangle;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import java.awt.geom.Rectangle2D;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Route Diagram Tab page in Camel.
 */
public class CamelRouteDiagram extends CamelPage {
    final private static ElementsCollection nodes = $$("[data-testid^='rf__node-']");
    final private static ElementsCollection actualNodes = $$(".camel-node-content");

    /**
     * Check that routes diagram is present on this page.
     */
    public void diagramIsPresent() {
        $$(".camel-node-content").shouldHave(sizeGreaterThan(1));
    }

    /**
     * Check that route nodes do not overlay/intersect.
     */
    public void nodesDoNotOverlay() {
        // Collect all node rectangles and IDs in one go (fewer WebDriver calls)
        List<Rectangle2D> rects = actualNodes
            .asFixedIterable()
            .stream()
            .map(el -> toAwtRectangle2D(el.getRect()))
            .collect(Collectors.toList());

        List<String> ids = nodes
            .asFixedIterable()
            .stream()
            .map(el -> el.getAttribute("data-testid"))
            .toList();

        IntStream.range(0, rects.size()).forEach(i -> {
            Rectangle2D rect1 = rects.get(i);
            String id1 = ids.get(i);

            IntStream.range(i + 1, rects.size()).forEach(j -> {
                Rectangle2D rect2 = rects.get(j);
                String id2 = ids.get(j);

                boolean overlaps = rectanglesOverlap(rect1, rect2);

                Assertions.assertThat(overlaps)
                    .as("Node %s at %s overlaps with node %s at %s", id1, rect1, id2, rect2)
                    .isFalse();
            });
        });
    }

    /**
     * Check that there are no duplications.
     */
    public void noNodeDuplicationsExist() {
        Set<String> routeNodes = new HashSet<>();
        for (SelenideElement node : nodes) {
            Rectangle2D rect = toAwtRectangle2D(node.getRect());

            String routeNode = String.format("%s|%f,%f,%f,%f",
                node.getAttribute("data-testid"), rect.getX(), rect.getY(), rect.getWidth(), rect.getHeight());

            Assertions.assertThat(routeNodes.add(routeNode))
                .as("Duplicate node found: %s", routeNode)
                .isTrue();
        }
    }

    /**
     * Convert Selenium Rectangle to java.awt.geom.Rectangle2D.Double.
     *
     * @param seleniumRect Selenium Rectangle
     * @return java awt Rectangle
     */
    private Rectangle2D.Double toAwtRectangle2D(Rectangle seleniumRect) {
        return new Rectangle2D.Double(
            seleniumRect.getX(),
            seleniumRect.getY(),
            seleniumRect.getWidth(),
            seleniumRect.getHeight()
        );
    }

    /**
     * Checks if two rectangles overlap or not.
     *
     * @param r1 first rectangle
     * @param r2 second rectangle
     * @return boolean if two rectangles overlap
     */
    private boolean rectanglesOverlap(Rectangle2D r1, Rectangle2D r2) {
        return !(r1.getMaxX() < r2.getMinX() ||
            r1.getMinX() > r2.getMaxX() ||
            r1.getMaxY() < r2.getMinY() ||
            r1.getMinY() > r2.getMaxY());
    }
}
